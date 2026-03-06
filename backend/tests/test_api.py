import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app
from database import Base, get_db
from models import Doctor, Appointment

# ─── Test Database Setup ──────────────────────────────────────────────────────

TEST_DB_URL = "sqlite:///./test_healthcare.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


# ─── Helpers ─────────────────────────────────────────────────────────────────

def create_test_doctor(name="Dr. Test Doctor", spec="Cardiology", start=9, end=17):
    res = client.post("/doctors/", json={"name": name, "specialization": spec,
                                          "start_hour": start, "end_hour": end})
    assert res.status_code == 201, res.text
    return res.json()


def future_slot(doctor, hour):
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    return f"{tomorrow}T{hour:02d}:00:00"


# ─── Doctor Tests ─────────────────────────────────────────────────────────────

def test_create_doctor_success():
    res = client.post("/doctors/", json={
        "name": "Dr. Alice Smith", "specialization": "Neurology",
        "start_hour": 8, "end_hour": 17
    })
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Dr. Alice Smith"
    assert data["id"] is not None


def test_create_doctor_name_too_short():
    res = client.post("/doctors/", json={
        "name": "Dr", "specialization": "Neurology",
        "start_hour": 8, "end_hour": 17
    })
    assert res.status_code == 422


def test_create_doctor_invalid_hours():
    res = client.post("/doctors/", json={
        "name": "Dr. Bob Jones", "specialization": "Cardiology",
        "start_hour": 17, "end_hour": 9  # end before start
    })
    assert res.status_code == 422


def test_create_doctor_hours_out_of_range():
    res = client.post("/doctors/", json={
        "name": "Dr. Bob Jones", "specialization": "Cardiology",
        "start_hour": 25, "end_hour": 30
    })
    assert res.status_code == 422


def test_list_doctors_empty():
    res = client.get("/doctors/")
    assert res.status_code == 200
    assert res.json() == []


def test_list_doctors():
    create_test_doctor("Dr. Carol White", "Dermatology")
    create_test_doctor("Dr. Dave Green", "Orthopedics")
    res = client.get("/doctors/")
    assert res.status_code == 200
    assert len(res.json()) == 2


# ─── Appointment Tests ────────────────────────────────────────────────────────

def test_book_appointment_success():
    doctor = create_test_doctor()
    slot = future_slot(doctor, 10)
    res = client.post("/appointments/", json={
        "doctor_id": doctor["id"],
        "patient_name": "Jane Doe",
        "slot": slot
    })
    assert res.status_code == 201
    data = res.json()
    assert data["patient_name"] == "Jane Doe"


def test_book_appointment_double_booking():
    doctor = create_test_doctor()
    slot = future_slot(doctor, 10)

    r1 = client.post("/appointments/", json={
        "doctor_id": doctor["id"], "patient_name": "Jane Doe", "slot": slot
    })
    assert r1.status_code == 201

    r2 = client.post("/appointments/", json={
        "doctor_id": doctor["id"], "patient_name": "John Smith", "slot": slot
    })
    assert r2.status_code == 409
    assert "already booked" in r2.json()["detail"]


def test_book_appointment_outside_working_hours():
    doctor = create_test_doctor(start=9, end=17)
    slot = future_slot(doctor, 7)  # 7 AM — before 9 AM start
    res = client.post("/appointments/", json={
        "doctor_id": doctor["id"], "patient_name": "Jane Doe", "slot": slot
    })
    assert res.status_code == 400
    assert "working hours" in res.json()["detail"]


def test_book_appointment_at_end_hour_boundary():
    """Slot at exact end_hour should be rejected (exclusive boundary)."""
    doctor = create_test_doctor(start=9, end=17)
    slot = future_slot(doctor, 17)  # 17:00 — equal to end_hour, not valid
    res = client.post("/appointments/", json={
        "doctor_id": doctor["id"], "patient_name": "Edge Case", "slot": slot
    })
    assert res.status_code == 400


def test_book_appointment_doctor_not_found():
    slot = future_slot({"id": 999}, 10)
    res = client.post("/appointments/", json={
        "doctor_id": 999, "patient_name": "Jane Doe", "slot": slot
    })
    assert res.status_code == 404


def test_book_appointment_patient_name_too_short():
    doctor = create_test_doctor()
    slot = future_slot(doctor, 10)
    res = client.post("/appointments/", json={
        "doctor_id": doctor["id"], "patient_name": "J", "slot": slot
    })
    assert res.status_code == 422


def test_cancel_appointment():
    doctor = create_test_doctor()
    slot = future_slot(doctor, 11)
    appt = client.post("/appointments/", json={
        "doctor_id": doctor["id"], "patient_name": "Alice", "slot": slot
    }).json()
    res = client.delete(f"/appointments/{appt['id']}")
    assert res.status_code == 200
    assert "cancelled" in res.json()["message"]


def test_cancel_nonexistent_appointment():
    res = client.delete("/appointments/9999")
    assert res.status_code == 404


def test_stats_endpoint():
    doctor = create_test_doctor()
    res = client.get("/stats/")
    assert res.status_code == 200
    data = res.json()
    assert "total_doctors" in data
    assert "appointments_today" in data
    assert "upcoming_appointments" in data
    assert data["total_doctors"] == 1


def test_list_appointments():
    doctor = create_test_doctor()
    slot = future_slot(doctor, 10)
    client.post("/appointments/", json={
        "doctor_id": doctor["id"], "patient_name": "Test Patient", "slot": slot
    })
    res = client.get("/appointments/")
    assert res.status_code == 200
    assert len(res.json()) == 1
