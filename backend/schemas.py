from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class DoctorBase(BaseModel):
    name: str
    specialization: str
    start_hour: int
    end_hour: int

    @field_validator("name")
    @classmethod
    def name_min_length(cls, v):
        if len(v.strip()) < 3:
            raise ValueError("Name must be at least 3 characters")
        return v.strip()

    @field_validator("start_hour", "end_hour")
    @classmethod
    def hour_range(cls, v):
        if not (0 <= v <= 23):
            raise ValueError("Hours must be between 0 and 23")
        return v

    @field_validator("end_hour")
    @classmethod
    def end_after_start(cls, v, info):
        if "start_hour" in info.data and v <= info.data["start_hour"]:
            raise ValueError("end_hour must be greater than start_hour")
        return v


class DoctorCreate(DoctorBase):
    pass


class DoctorResponse(DoctorBase):
    id: int

    class Config:
        from_attributes = True


class AppointmentBase(BaseModel):
    doctor_id: int
    patient_name: str
    slot: datetime

    @field_validator("patient_name")
    @classmethod
    def patient_name_min_length(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Patient name must be at least 2 characters")
        return v.strip()


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentResponse(AppointmentBase):
    id: int
    doctor: Optional[DoctorResponse] = None

    class Config:
        from_attributes = True
