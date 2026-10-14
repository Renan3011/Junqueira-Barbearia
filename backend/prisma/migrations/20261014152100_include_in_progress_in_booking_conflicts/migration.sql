ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_no_active_overlap";
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_no_active_overlap"
  EXCLUDE USING gist (tstzrange("startsAt", "endsAt", '[)') WITH &&)
  WHERE ("status" IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS'));
