-- CreateEnum
CREATE TYPE "ClientPortalAccessStatus" AS ENUM ('NOT_INVITED', 'INVITED', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "ClientInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "client_portal_access" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "ClientPortalAccessStatus" NOT NULL DEFAULT 'NOT_INVITED',
    "invitedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_portal_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_invitation" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "ClientInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_portal_access_clientId_key" ON "client_portal_access"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "client_portal_access_userId_key" ON "client_portal_access"("userId");

-- CreateIndex
CREATE INDEX "client_portal_access_status_idx" ON "client_portal_access"("status");

-- CreateIndex
CREATE UNIQUE INDEX "client_invitation_tokenHash_key" ON "client_invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "client_invitation_clientId_idx" ON "client_invitation"("clientId");

-- CreateIndex
CREATE INDEX "client_invitation_clientId_status_idx" ON "client_invitation"("clientId", "status");

-- CreateIndex
CREATE INDEX "client_invitation_email_idx" ON "client_invitation"("email");

-- CreateIndex
CREATE INDEX "client_invitation_expiresAt_idx" ON "client_invitation"("expiresAt");

-- AddForeignKey
ALTER TABLE "client_portal_access" ADD CONSTRAINT "client_portal_access_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_portal_access" ADD CONSTRAINT "client_portal_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_invitation" ADD CONSTRAINT "client_invitation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
