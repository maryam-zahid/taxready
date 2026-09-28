import { prisma } from "@/lib/prisma";

export type TaxReadyNotification = {
  id: string;
  title: string;
  description: string;
  href: string | null;
  createdAt: string;
  type: "info" | "warning" | "success";
  isRead: boolean;
};

function mapType(
  type: "INFO" | "ACTION_REQUIRED" | "WARNING" | "SUCCESS",
): TaxReadyNotification["type"] {
  if (type === "WARNING" || type === "ACTION_REQUIRED") {
    return "warning";
  }

  if (type === "SUCCESS") {
    return "success";
  }

  return "info";
}

export async function getAdminNotifications(
  organizationId: string,
): Promise<TaxReadyNotification[]> {
  const notifications = await prisma.notification.findMany({
    where: {
      organizationId,
      audience: "ADMIN",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    description: notification.message,
    href: notification.href,
    createdAt: notification.createdAt.toISOString(),
    type: mapType(notification.type),
    isRead: Boolean(notification.readAt),
  }));
}

export async function getClientNotifications(
  clientId: string,
): Promise<TaxReadyNotification[]> {
  const notifications = await prisma.notification.findMany({
    where: {
      clientId,
      audience: "CLIENT",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    description: notification.message,
    href: notification.href,
    createdAt: notification.createdAt.toISOString(),
    type: mapType(notification.type),
    isRead: Boolean(notification.readAt),
  }));
}

export async function createNotification(input: {
  organizationId: string;
  clientId?: string | null;
  userId?: string | null;
  audience: "ADMIN" | "CLIENT";
  type?: "INFO" | "ACTION_REQUIRED" | "WARNING" | "SUCCESS";
  title: string;
  message: string;
  href?: string | null;
}) {
  return prisma.notification.create({
    data: {
      organizationId: input.organizationId,
      clientId: input.clientId ?? null,
      userId: input.userId ?? null,
      audience: input.audience,
      type: input.type ?? "INFO",
      title: input.title,
      message: input.message,
      href: input.href ?? null,
    },
  });
}

export async function markNotificationRead(
  notificationId: string,
) {
  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      readAt: new Date(),
    },
  });
}

export async function markAdminNotificationsRead(
  organizationId: string,
) {
  return prisma.notification.updateMany({
    where: {
      organizationId,
      audience: "ADMIN",
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}

export async function markClientNotificationsRead(
  clientId: string,
) {
  return prisma.notification.updateMany({
    where: {
      clientId,
      audience: "CLIENT",
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}