-- CreateEnum
CREATE TYPE "BlockStatus" AS ENUM ('active', 'temporary', 'permanent');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('feedback', 'support', 'bug', 'system');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('pending', 'read', 'replied');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('active', 'completed', 'expired');

-- CreateTable
CREATE TABLE "BlockedUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "blockedDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "blockedBy" TEXT NOT NULL,
    "status" "BlockStatus" NOT NULL,
    "blockedUntil" TIMESTAMP(3),

    CONSTRAINT "BlockedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "aiConfidence" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "slipId" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedIP" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "blockedAt" TIMESTAMP(3) NOT NULL,
    "blockedBy" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "status" "BlockStatus" NOT NULL,

    CONSTRAINT "BlockedIP_pkey" PRIMARY KEY ("id")
);
