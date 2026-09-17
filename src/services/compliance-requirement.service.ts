import {
  RequirementSource,
  RequirementStatus,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import {
  evaluateComplianceRules,
  type ComplianceProfileSnapshot,
} from "@/domain/compliance/compliance-rules";

import { requirementCatalog } from "@/domain/compliance/requirement-catalog";

async function getAccessibleClientWithTaxProfile(
  userId: string,
  clientId: string
) {
  const membership =
    await prisma.organizationMember.findFirst({
      where: {
        userId,
      },
      select: {
        organizationId: true,
      },
    });

  if (!membership) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      organizationId: membership.organizationId,
    },
    include: {
      taxProfile: {
        include: {
          incomeSources: true,
          assetTypes: true,
          taxEvidenceTypes: true,
        },
      },
    },
  });

  if (!client) {
    throw new Error("CLIENT_NOT_FOUND");
  }

  if (!client.taxProfile) {
    throw new Error("TAX_PROFILE_NOT_FOUND");
  }

  return client;
}

function buildProfileSnapshot(
  client: Awaited<
    ReturnType<
      typeof getAccessibleClientWithTaxProfile
    >
  >
): ComplianceProfileSnapshot {
  const taxProfile = client.taxProfile;

  if (!taxProfile) {
    throw new Error("TAX_PROFILE_NOT_FOUND");
  }

  return {
    filingHistoryStatus:
      taxProfile.filingHistoryStatus,

    previousTaxReturnAvailable:
      taxProfile.previousTaxReturnAvailable,

    previousWealthStatementAvailable:
      taxProfile.previousWealthStatementAvailable,

    incomeSources: taxProfile.incomeSources.map(
      (item) => item.type
    ),

    assetTypes: taxProfile.assetTypes.map(
      (item) => item.type
    ),

    taxEvidenceTypes:
      taxProfile.taxEvidenceTypes.map(
        (item) => item.type
      ),

    hasLiabilities:
      taxProfile.hasLiabilities,

    hasMultipleEmployers:
      taxProfile.hasMultipleEmployers,
  };
}

async function syncRequirementDefinitions() {
  for (const definition of requirementCatalog) {
    await prisma.requirementDefinition.upsert({
      where: {
        code: definition.code,
      },

      create: {
        code: definition.code,
        title: definition.title,
        description: definition.description,
        category: definition.category,
        responseType: definition.responseType,
        active: true,
      },

      update: {
        title: definition.title,
        description: definition.description,
        category: definition.category,
        responseType: definition.responseType,
        active: true,
      },
    });
  }
}

export async function generateClientRequirementsForUser(
  userId: string,
  clientId: string
) {
  const client =
    await getAccessibleClientWithTaxProfile(
      userId,
      clientId
    );

  const profile = buildProfileSnapshot(client);

  const applicableCodes =
    evaluateComplianceRules(profile);

  await syncRequirementDefinitions();

  const definitions =
    await prisma.requirementDefinition.findMany({
      where: {
        code: {
          in: applicableCodes,
        },
        active: true,
      },
    });

  if (
    definitions.length !== applicableCodes.length
  ) {
    const foundCodes = new Set(
      definitions.map(
        (definition) => definition.code
      )
    );

    const missingCodes =
      applicableCodes.filter(
        (code) => !foundCodes.has(code)
      );

    console.error(
      "Missing requirement definitions:",
      missingCodes
    );

    throw new Error(
      "REQUIREMENT_DEFINITION_MISSING"
    );
  }

  return prisma.$transaction(async (tx) => {
    /*
     * Existing PROFILE_RULE requirements for this
     * client/tax year.
     *
     * MANUAL requirements are intentionally excluded.
     */
    const existingGeneratedRequirements =
      await tx.clientRequirement.findMany({
        where: {
          clientId: client.id,
          taxYear: client.taxYear,
          source: RequirementSource.PROFILE_RULE,
        },
        include: {
          requirementDefinition: true,
        },
      });

    const applicableCodeSet = new Set(
      applicableCodes
    );

  /*
 * Requirements that are no longer produced by the
 * current tax profile are retained for audit history.
 *
 * Only untouched PENDING or REQUESTED profile-rule
 * requirements are moved to NOT_APPLICABLE.
 *
 * Submitted, reviewed, completed or otherwise
 * actioned requirements are preserved unchanged.
 */
    const noLongerApplicableRequirementIds =
  existingGeneratedRequirements
    .filter((requirement) => {
      const isStillApplicable =
        applicableCodeSet.has(
          requirement.requirementDefinition.code
        );

      if (isStillApplicable) {
        return false;
      }

      return (
        requirement.status ===
          RequirementStatus.PENDING ||
        requirement.status ===
          RequirementStatus.REQUESTED
      );
    })
    .map((requirement) => requirement.id);

if (
  noLongerApplicableRequirementIds.length > 0
) {
  await tx.clientRequirement.updateMany({
    where: {
      id: {
        in: noLongerApplicableRequirementIds,
      },
    },
    data: {
      status:
        RequirementStatus.NOT_APPLICABLE,
    },
  });
}
   
    /*
     * Generate all currently applicable requirements.
     *
     * Upsert + DB unique constraint makes generation
     * idempotent. Running the engine repeatedly will
     * not create duplicate checklist items.
     */
   for (const definition of definitions) {
  const existingRequirement =
    existingGeneratedRequirements.find(
      (requirement) =>
        requirement.requirementDefinitionId ===
        definition.id
    );

  /*
   * Requirement does not exist yet.
   * Create a fresh profile-generated checklist item.
   */
  if (!existingRequirement) {
    await tx.clientRequirement.create({
      data: {
        clientId: client.id,
        requirementDefinitionId:
          definition.id,
        taxYear: client.taxYear,
        status: RequirementStatus.PENDING,
        source:
          RequirementSource.PROFILE_RULE,
        required: true,
      },
    });

    continue;
  }

  /*
   * Requirement previously became not applicable
   * because the tax profile changed.
   *
   * If the profile now makes it applicable again,
   * reactivate it as PENDING.
   */
  if (
    existingRequirement.status ===
    RequirementStatus.NOT_APPLICABLE
  ) {
    await tx.clientRequirement.update({
      where: {
        id: existingRequirement.id,
      },
      data: {
        status: RequirementStatus.PENDING,
        required: true,
      },
    });

    continue;
  }

  /*
   * Preserve workflow history.
   *
   * SUBMITTED, NEEDS_REVIEW, COMPLETED,
   * NOT_AVAILABLE and WAIVED must not be reset
   * merely because the rules engine runs again.
   */
  if (!existingRequirement.required) {
    await tx.clientRequirement.update({
      where: {
        id: existingRequirement.id,
      },
      data: {
        required: true,
      },
    });
  }
}
    return tx.clientRequirement.findMany({
      where: {
        clientId: client.id,
        taxYear: client.taxYear,
      },

      include: {
        requirementDefinition: true,
      },

      orderBy: [
        {
          requirementDefinition: {
            category: "asc",
          },
        },
        {
          createdAt: "asc",
        },
      ],
    });
  });
}

export async function getClientRequirementsForUser(
  userId: string,
  clientId: string
) {
  const client =
    await getAccessibleClientWithTaxProfile(
      userId,
      clientId
    );

  return prisma.clientRequirement.findMany({
    where: {
      clientId: client.id,
      taxYear: client.taxYear,
    },

    include: {
      requirementDefinition: true,
    },

    orderBy: [
      {
        requirementDefinition: {
          category: "asc",
        },
      },
      {
        createdAt: "asc",
      },
    ],
  });
}