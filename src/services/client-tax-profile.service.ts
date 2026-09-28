import {
  AssetType,
  FilingHistoryStatus,
  IncomeSourceType,
  TaxEvidenceType,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import type { ClientTaxProfileInput } from "@/lib/validations/client-tax-profile";

async function getAccessibleClient(
  userId: string,
  clientId: string,
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
    select: {
      id: true,
      type: true,
      taxpayerType: true,
      entityType: true,
      taxYear: true,
    },
  });

  if (!client) {
    throw new Error("CLIENT_NOT_FOUND");
  }

  return client;
}

export async function getClientTaxProfileForUser(
  userId: string,
  clientId: string,
) {
  await getAccessibleClient(userId, clientId);

  return prisma.clientTaxProfile.findUnique({
    where: {
      clientId,
    },
    include: {
      incomeSources: true,
      assetTypes: true,
      taxEvidenceTypes: true,
    },
  });
}

export async function saveClientTaxProfileForUser(
  userId: string,
  clientId: string,
  input: ClientTaxProfileInput,
) {
  await getAccessibleClient(userId, clientId);

  return prisma.$transaction(async (tx) => {
    const taxProfile =
      await tx.clientTaxProfile.upsert({
        where: {
          clientId,
        },

        create: {
          clientId,

          filingHistoryStatus:
            FilingHistoryStatus[
              input.filingHistoryStatus
            ],

          previousTaxReturnAvailable:
            input.previousTaxReturnAvailable,

          previousWealthStatementAvailable:
            input.previousWealthStatementAvailable,

          hasLiabilities:
            input.hasLiabilities,

          hasMultipleEmployers:
            input.hasMultipleEmployers,

          openingWealth:
            input.openingWealth,
          wealthAdditions:
            input.wealthAdditions,
          wealthReductions:
            input.wealthReductions,
          closingWealth:
            input.closingWealth,

          internalNotes:
            input.internalNotes || null,
        },

        update: {
          filingHistoryStatus:
            FilingHistoryStatus[
              input.filingHistoryStatus
            ],

          previousTaxReturnAvailable:
            input.previousTaxReturnAvailable,

          previousWealthStatementAvailable:
            input.previousWealthStatementAvailable,

          hasLiabilities:
            input.hasLiabilities,

          hasMultipleEmployers:
            input.hasMultipleEmployers,

          openingWealth:
            input.openingWealth,
          wealthAdditions:
            input.wealthAdditions,
          wealthReductions:
            input.wealthReductions,
          closingWealth:
            input.closingWealth,

          internalNotes:
            input.internalNotes || null,
        },
      });

    await tx.clientIncomeSource.deleteMany({
      where: {
        taxProfileId: taxProfile.id,
      },
    });

    await tx.clientAssetType.deleteMany({
      where: {
        taxProfileId: taxProfile.id,
      },
    });

    await tx.clientTaxEvidenceType.deleteMany({
      where: {
        taxProfileId: taxProfile.id,
      },
    });

    if (input.incomeSources.length > 0) {
      const declaredAmounts = new Map(
        input.declaredIncomeAmounts.map(
          (item) => [
            item.type,
            item.declaredAmount,
          ],
        ),
      );

      await tx.clientIncomeSource.createMany({
        data: input.incomeSources.map(
          (type) => ({
            taxProfileId: taxProfile.id,
            type: IncomeSourceType[type],

            declaredAmount:
              declaredAmounts.get(type) ??
              null,
          }),
        ),
      });
    }

    if (input.assetTypes.length > 0) {
      await tx.clientAssetType.createMany({
        data: input.assetTypes.map(
          (type) => ({
            taxProfileId: taxProfile.id,
            type: AssetType[type],
          }),
        ),
      });
    }

    if (input.taxEvidenceTypes.length > 0) {
      await tx.clientTaxEvidenceType.createMany({
        data: input.taxEvidenceTypes.map(
          (type) => ({
            taxProfileId: taxProfile.id,
            type: TaxEvidenceType[type],
          }),
        ),
      });
    }

    return tx.clientTaxProfile.findUnique({
      where: {
        id: taxProfile.id,
      },
      include: {
        incomeSources: true,
        assetTypes: true,
        taxEvidenceTypes: true,
      },
    });
  });
}