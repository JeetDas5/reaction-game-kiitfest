/*
  Warnings:

  - You are about to drop the column `rollNo` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `rollNo` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Record` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[KFid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `KFid` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Record" DROP CONSTRAINT "Record_rollNo_fkey";

-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_userId_fkey";

-- DropIndex
DROP INDEX "Record_id_time_rollNo_idx";

-- DropIndex
DROP INDEX "Record_rollNo_key";

-- DropIndex
DROP INDEX "Round_userId_roundNumber_idx";

-- DropIndex
DROP INDEX "User_id_name_rollNo_idx";

-- DropIndex
DROP INDEX "User_rollNo_key";

-- AlterTable
ALTER TABLE "Record" DROP COLUMN "rollNo",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "rollNo",
ADD COLUMN     "KFid" TEXT NOT NULL,
ADD COLUMN     "receivedGoodies" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Record_userId_key" ON "Record"("userId");

-- CreateIndex
CREATE INDEX "Record_id_time_userId_idx" ON "Record"("id", "time", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_KFid_key" ON "User"("KFid");

-- CreateIndex
CREATE INDEX "User_id_KFid_idx" ON "User"("id", "KFid");

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "userId_roundNumber" RENAME TO "Round_userId_roundNumber_key";
