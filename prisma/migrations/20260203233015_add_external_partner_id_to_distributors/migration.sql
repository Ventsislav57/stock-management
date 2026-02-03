/*
  Warnings:

  - A unique constraint covering the columns `[external_partner_id]` on the table `distributors` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "distributors" ADD COLUMN     "external_partner_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "distributors_external_partner_id_key" ON "distributors"("external_partner_id");
