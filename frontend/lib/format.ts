export function formatDate(value: string | Date): string {
      const date = typeof value === "string" ? new Date(value) : value;
      return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(value: string | Date): string {
      const date = typeof value === "string" ? new Date(value) : value;
      return date.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
      });
}

/** Treat a YYYY-MM-DD date input as end of that local day for API deadlines. */
export function dateInputToEndOfDayIso(dateInput: string): string {
      return new Date(`${dateInput}T23:59:59`).toISOString();
}
