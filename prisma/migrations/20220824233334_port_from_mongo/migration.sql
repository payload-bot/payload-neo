-- CreateEnum
CREATE TYPE "WebhookType" AS ENUM ('users', 'channels');

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT 'pls ',
    "language" TEXT NOT NULL DEFAULT 'en-US',
    "pushed" INTEGER NOT NULL DEFAULT 0,
    "webhookId" TEXT,
    "enableSnipeForEveryone" BOOLEAN NOT NULL DEFAULT false,
    "commandRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "steamId" TEXT,
    "webhookId" TEXT,
    "pushed" INTEGER NOT NULL DEFAULT 0,
    "pushedToday" INTEGER NOT NULL DEFAULT 0,
    "lastPushed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "WebhookType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_value_key" ON "Webhook"("value");

-- AddForeignKey
ALTER TABLE "Guild" ADD CONSTRAINT "Guild_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
