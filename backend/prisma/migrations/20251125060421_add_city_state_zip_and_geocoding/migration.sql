/*
  Warnings:

  - Added the required column `city` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Tour` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Family" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
-- First add columns as nullable
ALTER TABLE "Tour" ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- Set default values for existing rows
UPDATE "Tour" SET "city" = 'Unknown', "state" = 'XX', "zipCode" = '00000' WHERE "city" IS NULL;

-- Now make them required
ALTER TABLE "Tour" ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "zipCode" SET NOT NULL;
