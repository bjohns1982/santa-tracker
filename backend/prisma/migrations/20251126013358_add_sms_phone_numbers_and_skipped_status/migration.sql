-- AlterEnum
ALTER TYPE "VisitStatus" ADD VALUE 'SKIPPED';

-- AlterTable
ALTER TABLE "Family" ADD COLUMN     "phoneNumber1" TEXT,
ADD COLUMN     "phoneNumber2" TEXT,
ADD COLUMN     "smsOptIn" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "smsResponse" TEXT,
ADD COLUMN     "smsResponseAt" TIMESTAMP(3);
