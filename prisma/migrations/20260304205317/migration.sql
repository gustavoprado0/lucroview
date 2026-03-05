/*
  Warnings:

  - Added the required column `highestCategory` to the `FinancialInsight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FinancialInsight" ADD COLUMN     "highestCategory" TEXT NOT NULL;
