-- Seed data for Healthcare Appointment Booking System

INSERT INTO doctors (name, specialization, start_hour, end_hour) VALUES
  ('Dr. Sarah Chen', 'Cardiology', 8, 17),
  ('Dr. Marcus Webb', 'Neurology', 9, 18),
  ('Dr. Priya Kapoor', 'Orthopedics', 7, 15),
  ('Dr. James Okafor', 'General Practice', 8, 20),
  ('Dr. Amelia Torres', 'Dermatology', 10, 18);

INSERT INTO appointments (doctor_id, patient_name, slot) VALUES
  (1, 'Alice Johnson', datetime('now', '+1 day', 'start of day', '+9 hours')),
  (1, 'Bob Smith', datetime('now', '+1 day', 'start of day', '+11 hours')),
  (2, 'Carol Davis', datetime('now', '+2 days', 'start of day', '+10 hours')),
  (3, 'David Lee', datetime('now', 'start of day', '+8 hours')),
  (4, 'Emma Wilson', datetime('now', 'start of day', '+14 hours'));
