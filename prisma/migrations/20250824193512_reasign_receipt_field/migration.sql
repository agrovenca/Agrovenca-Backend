/*
  Warnings:

  - You are about to drop the column `receipt` on the `Order` table. All the data in the column will be lost.
  - Added the required column `receipt` to the `OrderPayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "receipt";

-- AlterTable
ALTER TABLE "public"."OrderPayment" ADD COLUMN     "receipt" VARCHAR(800) NOT NULL;
