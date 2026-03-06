from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
import crud
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Healthcare Appointment Booking API",
    description="API for booking doctor appointments with slot conflict detection and working-hours enforcement.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Doctors ──────────────────────────────────────────────────────────────────

@app.post("/doctors/", response_model=schemas.DoctorResponse, status_code=201, tags=["Doctors"])
def create_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    """Add a new doctor with working hour constraints."""
    return crud.create_doctor(db, doctor)


@app.get("/doctors/", response_model=List[schemas.DoctorResponse], tags=["Doctors"])
def list_doctors(db: Session = Depends(get_db)):
    """List all registered doctors."""
    return crud.get_doctors(db)


@app.get("/doctors/{doctor_id}", response_model=schemas.DoctorResponse, tags=["Doctors"])
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    """Get a specific doctor by ID."""
    doctor = crud.get_doctor(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


# ─── Appointments ─────────────────────────────────────────────────────────────

@app.post("/appointments/", response_model=schemas.AppointmentResponse, status_code=201, tags=["Appointments"])
def book_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    """Book an appointment. Enforces working hours and prevents double-booking."""
    return crud.create_appointment(db, appointment)


@app.get("/appointments/", response_model=List[schemas.AppointmentResponse], tags=["Appointments"])
def list_appointments(db: Session = Depends(get_db)):
    """List all booked appointments."""
    return crud.get_appointments(db)


@app.delete("/appointments/{id}", status_code=200, tags=["Appointments"])
def cancel_appointment(id: int, db: Session = Depends(get_db)):
    """Cancel an existing appointment by ID."""
    crud.delete_appointment(db, id)
    return {"message": f"Appointment {id} cancelled successfully"}


# ─── Stats ────────────────────────────────────────────────────────────────────

@app.get("/stats/", tags=["Stats"])
def get_stats(db: Session = Depends(get_db)):
    """Dashboard summary statistics."""
    return {
        "total_doctors": len(crud.get_doctors(db)),
        "appointments_today": crud.get_appointments_today(db),
        "upcoming_appointments": crud.get_upcoming_appointments(db),
    }


@app.get("/doctors/{doctor_id}/booked-slots", tags=["Doctors"])
def get_booked_slots(doctor_id: int, date: str, db: Session = Depends(get_db)):
    """Get booked hour slots for a doctor on a given date (YYYY-MM-DD)."""
    return crud.get_booked_slots(db, doctor_id, date)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
