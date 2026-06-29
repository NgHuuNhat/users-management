export function formatDate(value: any) {
  if (!value) return "-";

  try {
    let date: Date;

    // Firestore Timestamp
    if (typeof value?.toDate === "function") {
      date = value.toDate();
    }
    // { seconds, nanoseconds }
    else if (
      typeof value === "object" &&
      typeof value.seconds === "number"
    ) {
      date = new Date(value.seconds * 1000);
    }
    // String kiểu Firebase Console
    else if (
      typeof value === "string" &&
      value.includes(" UTC+")
    ) {
      const iso = value
        .replace(" at ", " ")
        .replace(/ UTC([+-]\d+)/, "$1:00");

      date = new Date(iso);
    }
    // ISO string hoặc Date
    else {
      date = new Date(value);
    }

    if (isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("vi-VN");
  } catch {
    return String(value);
  }
}