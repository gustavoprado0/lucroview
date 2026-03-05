/*
  Warnings:

  - You are about to drop the column `month` on the `FinancialInsight` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `FinancialInsight` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FinancialInsight" DROP COLUMN "month",
DROP COLUMN "year";
