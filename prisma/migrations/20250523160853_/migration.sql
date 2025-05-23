/*
  Warnings:

  - You are about to drop the column `token` on the `ResetPassword` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `ResetPassword` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `ResetPassword` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ResetPassword_token_key";

-- AlterTable
ALTER TABLE "ResetPassword" DROP COLUMN "token",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "ResetPassword_code_key" ON "ResetPassword"("code");
