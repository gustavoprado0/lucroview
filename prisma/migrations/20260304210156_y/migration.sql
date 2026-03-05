/*
  Warnings:

  - You are about to drop the column `balance` on the `FinancialInsight` table. All the data in the column will be lost.
  - You are about to drop the column `highestCategory` on the `FinancialInsight` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `FinancialInsight` table. All the data in the column will be lost.
  - You are about to drop the column `savingsRate` on the `FinancialInsight` table. All the data in the column will be lost.
  - You are about to drop the column `trend` on the `FinancialInsight` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FinancialInsight_userId_month_year_key";

-- AlterTable
ALTER TABLE "FinancialInsight" DROP COLUMN "balance",
DROP COLUMN "highestCategory",
DROP COLUMN "level",
DROP COLUMN "savingsRate",
DROP COLUMN "trend";
