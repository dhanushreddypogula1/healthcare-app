// Frontend Unit Tests — Jest + React Testing Library
// Tests: doctor form validation, slot generation, appointment cancellation flow

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { generateSlots, formatHour, buildSlot, todayStr } from "../utils/helpers";

// ─── Test 1: Slot Generation Logic ───────────────────────────────────────────

describe("generateSlots", () => {
  test("generates correct slots between startHour and endHour", () => {
    const slots = generateSlots(9, 12);
    expect(slots).toEqual([9, 10, 11]);
  });

  test("returns empty array when start equals end", () => {
    expect(generateSlots(10, 10)).toEqual([]);
  });

  test("returns empty array when start is greater than end", () => {
    expect(generateSlots(17, 9)).toEqual([]);
  });

  test("handles full working day 8-17", () => {
    const slots = generateSlots(8, 17);
    expect(slots.length).toBe(9);
    expect(slots[0]).toBe(8);
    expect(slots[slots.length - 1]).toBe(16);
  });
});

describe("formatHour", () => {
  test("formats morning hour correctly", () => {
    expect(formatHour(9)).toBe("9:00 AM");
  });

  test("formats noon correctly", () => {
    expect(formatHour(12)).toBe("12:00 PM");
  });

  test("formats afternoon hour correctly", () => {
    expect(formatHour(14)).toBe("2:00 PM");
  });

  test("formats midnight correctly", () => {
    expect(formatHour(0)).toBe("12:00 AM");
  });
});

describe("buildSlot", () => {
  test("builds correct ISO string for hour 9", () => {
    expect(buildSlot("2026-03-10", 9)).toBe("2026-03-10T09:00:00");
  });

  test("builds correct ISO string for hour 14", () => {
    expect(buildSlot("2026-03-10", 14)).toBe("2026-03-10T14:00:00");
  });
});

// ─── Test 2: Doctor Form Validation Logic ─────────────────────────────────────

function validateDoctorForm({ name, specialization, start_hour, end_hour }) {
  const errors = {};
  if (!name || name.trim().length < 3) errors.name = "Name must be at least 3 characters";
  if (!specialization) errors.specialization = "Specialization is required";
  const s = parseInt(start_hour, 10);
  const e = parseInt(end_hour, 10);
  if (isNaN(s) || s < 0 || s > 23) errors.start_hour = "Must be 0–23";
  if (isNaN(e) || e < 0 || e > 23) errors.end_hour = "Must be 0–23";
  if (!errors.start_hour && !errors.end_hour && s >= e)
    errors.end_hour = "End hour must be greater than start hour";
  return errors;
}

describe("Doctor Form Validation", () => {
  test("accepts valid doctor data", () => {
    const errors = validateDoctorForm({
      name: "Dr. Jane Smith",
      specialization: "Cardiology",
      start_hour: "9",
      end_hour: "17",
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test("rejects name shorter than 3 characters", () => {
    const errors = validateDoctorForm({
      name: "Dr",
      specialization: "Cardiology",
      start_hour: "9",
      end_hour: "17",
    });
    expect(errors.name).toBeTruthy();
  });

  test("rejects missing specialization", () => {
    const errors = validateDoctorForm({
      name: "Dr. Smith",
      specialization: "",
      start_hour: "9",
      end_hour: "17",
    });
    expect(errors.specialization).toBeTruthy();
  });

  test("rejects start_hour >= end_hour", () => {
    const errors = validateDoctorForm({
      name: "Dr. Smith",
      specialization: "Cardiology",
      start_hour: "17",
      end_hour: "9",
    });
    expect(errors.end_hour).toBeTruthy();
  });

  test("rejects hours out of 0-23 range", () => {
    const errors = validateDoctorForm({
      name: "Dr. Smith",
      specialization: "Cardiology",
      start_hour: "25",
      end_hour: "30",
    });
    expect(errors.start_hour).toBeTruthy();
    expect(errors.end_hour).toBeTruthy();
  });
});

// ─── Test 3: Appointment Cancellation Confirmation UI ─────────────────────────

function CancelConfirmUI({ onConfirm, onCancel }) {
  return (
    <div>
      <p>Are you sure you want to cancel this appointment?</p>
      <button onClick={onCancel}>Keep it</button>
      <button onClick={onConfirm}>Yes, Cancel</button>
    </div>
  );
}

describe("Appointment Cancellation Confirmation", () => {
  test("renders confirmation message", () => {
    render(<CancelConfirmUI onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  test("calls onCancel when Keep it is clicked", () => {
    const onCancel = jest.fn();
    render(<CancelConfirmUI onConfirm={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Keep it"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("calls onConfirm when Yes, Cancel is clicked", () => {
    const onConfirm = jest.fn();
    render(<CancelConfirmUI onConfirm={onConfirm} onCancel={() => {}} />);
    fireEvent.click(screen.getByText("Yes, Cancel"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test("does not auto-cancel without user action", () => {
    const onConfirm = jest.fn();
    render(<CancelConfirmUI onConfirm={onConfirm} onCancel={() => {}} />);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
