export function getShiftStartDateTime(
  workDate: Date,
  shiftStartTime: Date
): Date {
  const timezoneOffsetMinutes = Number(
    process.env.TIMEZONE_OFFSET_MINUTES ?? 420
  );

  /*
   * workDate dari PostgreSQL @db.Date
   * contoh: 2026-08-27
   */
  const year = workDate.getUTCFullYear();
  const month = workDate.getUTCMonth();
  const day = workDate.getUTCDate();

  /*
   * startTime dari PostgreSQL @db.Time
   * contoh: 08:00
   */
  const hours = shiftStartTime.getUTCHours();
  const minutes = shiftStartTime.getUTCMinutes();
  const seconds = shiftStartTime.getUTCSeconds();

  /*
   * Buat waktu shift seolah-olah UTC dulu.
   */
  const shiftAsUtc = Date.UTC(
    year,
    month,
    day,
    hours,
    minutes,
    seconds
  );

  /*
   * Karena jam shift adalah jam lokal WIB,
   * ubah ke timestamp UTC sebenarnya.
   *
   * Contoh:
   * 08:00 WIB = 01:00 UTC
   */
  return new Date(
    shiftAsUtc -
      timezoneOffsetMinutes * 60 * 1000
  );
}

export function determineAttendanceStatus(
  checkInAt: Date,
  workDate: Date,
  shiftStartTime: Date
): "present" | "late" {
  const toleranceMinutes = Number(
    process.env.LATE_TOLERANCE_MINUTES ?? 10
  );

  const shiftStart = getShiftStartDateTime(
    workDate,
    shiftStartTime
  );

  const lateThreshold = new Date(
    shiftStart.getTime() +
      toleranceMinutes * 60 * 1000
  );

  return checkInAt.getTime() <= lateThreshold.getTime()
    ? "present"
    : "late";
}

export function isScheduleToday(
  workDate: Date
): boolean {
  const timezoneOffsetMinutes = Number(
    process.env.TIMEZONE_OFFSET_MINUTES ?? 420
  );

  const now = new Date();

  const localNow = new Date(
    now.getTime() +
      timezoneOffsetMinutes * 60 * 1000
  );

  return (
    workDate.getUTCFullYear() ===
      localNow.getUTCFullYear() &&
    workDate.getUTCMonth() ===
      localNow.getUTCMonth() &&
    workDate.getUTCDate() ===
      localNow.getUTCDate()
  );
}