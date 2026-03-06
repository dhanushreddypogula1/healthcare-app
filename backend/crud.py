from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from fastapi import HTTPException
import models
import schemas


# ─── Doctors ──────────────────────────────────────────────────────────────────

def create_doctor(db: Session, doctor: schemas.DoctorCreate) -> models.Doctor:
    db_doctor = models.Doctor(**doctor.model_dump())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor


def get_doctors(db: Session) -> list[models.Doctor]:
    return db.query(models.Doctor).all()


def get_doctor(db: Session, doctor_id: int) -> models.Doctor | None:
    return db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()


# ─── Appointments ─────────────────────────────────────────────────────────────

def create_appointment(db: Session, appointment: schemas.AppointmentCreate) -> models.Appointment:
    doctor = get_doctor(db, appointment.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    slot_hour = appointment.slot.hour

    # Enforce working hours
    if not (doctor.start_hour <= slot_hour < doctor.end_hour):
        raise HTTPException(
            status_code=400,
            detail=f"Slot {slot_hour}:00 is outside Dr. {doctor.name}'s working hours "
                   f"({doctor.start_hour}:00 – {doctor.end_hour}:00)"
        )

    # Prevent double-booking
    existing = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == appointment.doctor_id,
        models.Appointment.slot == appointment.slot
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Dr. {doctor.name} is already booked at {appointment.slot.strftime('%I:%M %p on %b %d, %Y')}"
        )

    db_appt = models.Appointment(**appointment.model_dump())
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)
    return db_appt


def get_appointments(db: Session) -> list[models.Appointment]:
    return db.query(models.Appointment).all()


def get_appointment(db: Session, appointment_id: int) -> models.Appointment | None:
    return db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()


def delete_appointment(db: Session, appointment_id: int) -> bool:
    appt = get_appointment(db, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appt)
    db.commit()
    return True


def get_appointments_today(db: Session) -> int:
    today = date.today()
    return db.query(models.Appointment).filter(
        func.date(models.Appointment.slot) == today
    ).count()


def get_upcoming_appointments(db: Session) -> int:
    now = datetime.now()
    return db.query(models.Appointment).filter(
        models.Appointment.slot >= now
    ).count()


def get_booked_slots(db: Session, doctor_id: int, date_str: str) -> list[str]:
    """Return list of booked hour strings (e.g. '10') for a given doctor and date."""
    appts = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id,
        func.date(models.Appointment.slot) == date_str
    ).all()
    return [str(a.slot.hour) for a in appts]
