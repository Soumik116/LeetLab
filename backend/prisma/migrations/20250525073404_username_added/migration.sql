/*
  Warnings:

  - You are about to drop the column `referenceSolution` on the `problem` table. All the data in the column will be lost.
  - Added the required column `referenceSolutions` to the `problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "problem" DROP COLUMN "referenceSolution",
ADD COLUMN     "referenceSolutions" JSONB NOT NULL;
