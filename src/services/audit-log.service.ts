import { AuditAction } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type CreateAuditLogInput = {
  organizationId: string;
  clientId?: string | null;
  userId?: string | null;
  action: AuditAction;
  description: string;
  entityType?: string | null;
  entityId?: string | null;
};

export async function createAuditLog(
  input: CreateAuditLogInput,
) {
  try {
    return await prisma.auditLog.create({
      data: {
        organizationId: input.organizationId,
        clientId: input.clientId ?? null,
        userId: input.userId ?? null,
        action: input.action,
        description: input.description,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
      },
    });
  } catch (error) {
    // Audit logging should not break the main business workflow.
    console.error("Failed to create audit log:", error);
    return null;
  }
}

export async function getClientAuditLogs(input: {
  organizationId: string;
  clientId: string;
  limit?: number;
}) {
  return prisma.auditLog.findMany({
    where: {
      organizationId: input.organizationId,
      clientId: input.clientId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: input.limit ?? 50,
  });
}

export async function getOrganizationAuditLogs(input: {
  organizationId: string;
  limit?: number;
}) {
  const logs = await prisma.auditLog.findMany({
    where: {
      organizationId: input.organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: input.limit ?? 100,
  });

  const clientIds = [
    ...new Set(
      logs
        .map((log) => log.clientId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const clients =
    clientIds.length > 0
      ? await prisma.client.findMany({
          where: {
            organizationId: input.organizationId,
            id: {
              in: clientIds,
            },
          },
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            businessName: true,
          },
        })
      : [];

  const clientMap = new Map(
    clients.map((client) => [
      client.id,
      client.type === "BUSINESS"
        ? client.businessName || "Business client"
        : [client.firstName, client.lastName]
            .filter(Boolean)
            .join(" ") || "Individual client",
    ]),
  );

  return logs.map((log) => ({
    ...log,
    clientName: log.clientId
      ? clientMap.get(log.clientId) ?? "Unknown client"
      : null,
  }));
}