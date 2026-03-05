/*
  Warnings:

  - A unique constraint covering the columns `[userId,month,year]` on the table `FinancialInsight` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `balance` to the `FinancialInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `FinancialInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `FinancialInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `savingsRate` to the `FinancialInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trend` to the `FinancialInsight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `FinancialInsight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FinancialInsight" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "level" TEXT NOT NULL,
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "savingsRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "trend" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FinancialInsight_userId_month_year_key" ON "FinancialInsight"("userId", "month", "year");
