# MediBook — Healthcare Appointment Booking System

A full-stack healthcare appointment booking system built with **FastAPI** (backend), **ReactJS** (frontend), **SQLite + Alembic** (database), and a Python SDK generated via OpenAPI Generator CLI.

---

## Project Structure

```
healthcare_app/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── crud.py              # Business logic & DB operations
│   ├── database.py          # DB connection & session management
│   ├── seed_data.sql        # Initial test data
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   └── tests/
│       └── test_api.py      # Backend unit tests (pytest)
├── frontend/
│   ├── .env                 # REACT_APP_API_BASE_URL
│   ├── package.json
│   ├── public/index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── services/api.js          # Axios service layer
│       ├── context/store.js         # Zustand global state
│       ├── hooks/index.js           # useDoctors, useAppointments, useStats
│       ├── utils/helpers.js         # Date/slot utilities
│       ├── components/
│       │   ├── Modal.jsx
│       │   ├── Spinner.jsx
│       │   ├── Toast.jsx
│       │   └── BookAppointmentForm.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── DoctorsPage.jsx
│       │   └── AppointmentsPage.jsx
│       └── __tests__/
│           └── app.test.js
├── generate_sdk.py          # SDK generation script
├── setupdev.bat             # Dev environment setup
└── runapplication.bat       # Application launcher
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+ & npm
- (Optional) `sqlite3` CLI for seeding data

---

## Quick Start

### Option A — Using batch scripts (Windows)

```bat
:: 1. Set up the environment
setupdev.bat

:: 2. Start the application
runapplication.bat
```

### Option B — Manual setup

#### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv env
env\Scripts\activate          # Windows
source env/bin/activate       # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# (Optional) Seed test data
sqlite3 healthcare.db < seed_data.sql

# Start the API server
python main.py
```

The backend starts at **http://localhost:8000**  
Swagger UI: **http://localhost:8000/docs**

#### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend starts at **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/doctors/` | Add a new doctor |
| `GET` | `/doctors/` | List all doctors |
| `GET` | `/doctors/{id}` | Get doctor by ID |
| `GET` | `/doctors/{id}/booked-slots` | Get booked slots for a doctor on a date |
| `POST` | `/appointments/` | Book an appointment |
| `GET` | `/appointments/` | List all appointments |
| `DELETE` | `/appointments/{id}` | Cancel an appointment |
| `GET` | `/stats/` | Dashboard summary statistics |

### Trick Logic Enforced

- **Double-booking prevention**: If a doctor already has an appointment at a given slot, a `409 Conflict` is returned.
- **Working hours enforcement**: Appointments outside the doctor's `start_hour`–`end_hour` range return `400 Bad Request`.

---

## Running Backend Tests

```bash
cd backend
pytest tests/test_api.py -v
```

Tests cover:
- Doctor creation (valid + validation failures)
- Appointment booking (success, double-booking, outside hours, boundary conditions)
- Appointment cancellation
- Stats endpoint

---

## Running Frontend Tests

```bash
cd frontend
npm test
```

Tests cover:
- Slot generation logic (`generateSlots`, `formatHour`, `buildSlot`)
- Doctor form validation rules
- Appointment cancellation confirmation UI flow

---

## SDK Generation

Ensure the backend is running, then:

```bash
# Install OpenAPI Generator CLI
npm install -g @openapitools/openapi-generator-cli

# Generate Python SDK
python generate_sdk.py

# Or manually:
openapi-generator-cli generate \
  -i http://localhost:8000/openapi.json \
  -g python \
  -o health_sdk \
  --package-name health_sdk
```

### Example SDK Usage

```python
from health_sdk.api.doctors_api import DoctorsApi
from health_sdk import ApiClient

client = ApiClient()
api = DoctorsApi(client)
doctors = api.doctors_list()
print(doctors)
```

---

## Frontend Features

- **Dashboard** — Stat cards (total doctors, today's appointments, upcoming), bar chart, quick-book shortcut
- **Doctors Page** — Card grid with search/filter, Add Doctor modal with inline validation
- **Appointments Page** — Sortable table, filter, cancel with confirmation modal, auto-polls every 20s
- **Book Appointment** — Doctor selector, date picker (past dates disabled), dynamic slot grid with booked slots visually disabled, loading spinner, success toast

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |

---

*Built for the OPC Intern Coding Challenge · March 2026*
