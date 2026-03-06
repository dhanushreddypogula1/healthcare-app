// Format slot to human-readable string
export function formatSlot(slotStr) {
  const d = new Date(slotStr);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Generate 1-hour slots between start_hour and end_hour (exclusive)
export function generateSlots(startHour, endHour) {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push(h);
  }
  return slots;
}

// Format hour number to display string
export function formatHour(h) {
  const period = h >= 12 ? "PM" : "AM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${period}`;
}

// Today in YYYY-MM-DD
export function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// Build ISO slot string from date + hour
export function buildSlot(dateStr, hour) {
  return `${dateStr}T${String(hour).padStart(2, "0")}:00:00`;
}

// Check if date string is in the past
export function isPastDate(dateStr) {
  return new Date(dateStr) < new Date(new Date().toDateString());
}
