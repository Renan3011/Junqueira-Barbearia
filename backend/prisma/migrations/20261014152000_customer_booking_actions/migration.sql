ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';

ALTER TABLE "Booking"
  ADD COLUMN "customerActionTokenHash" TEXT,
  ADD COLUMN "customerActionExpiresAt" TIMESTAMPTZ(6),
  ADD COLUMN "cancelledByCustomerAt" TIMESTAMPTZ(6);

CREATE UNIQUE INDEX "Booking_customerActionTokenHash_key" ON "Booking"("customerActionTokenHash") WHERE "customerActionTokenHash" IS NOT NULL;
