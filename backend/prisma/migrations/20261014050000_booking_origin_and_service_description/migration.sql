CREATE TYPE "BookingOrigin" AS ENUM ('SITE', 'BARBER');
ALTER TABLE "Service" ADD COLUMN "description" TEXT;
ALTER TABLE "Booking" ADD COLUMN "origin" "BookingOrigin" NOT NULL DEFAULT 'SITE';
ALTER TABLE "Booking" ADD COLUMN "readAt" TIMESTAMP(3);
CREATE INDEX "Booking_status_readAt_idx" ON "Booking"("status", "readAt");
