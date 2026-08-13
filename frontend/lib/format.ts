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

/** Convert an ISO timestamp to a YYYY-MM-DD value for `<input type="date">`. */
export function isoToDateInput(value: string): string {
      const date = new Date(value);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
}
