/*
  Warnings:

  - Added the required column `partySize` to the `WaitingEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WaitingEntry" ADD COLUMN     "partySize" INTEGER NOT NULL;
