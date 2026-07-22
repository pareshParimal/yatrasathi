ALTER TABLE travel_plans
ADD COLUMN pnr_number VARCHAR(50),
ADD COLUMN booked_train_name VARCHAR(100),
ADD COLUMN booked_hotel_name VARCHAR(100),
ADD COLUMN booking_status VARCHAR(50) DEFAULT 'PENDING';
