export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
      return <div className="sm-card p-8 text-center text-sm text-[var(--color-ink-soft)]">{label}</div>;
}

export function ErrorBlock({ message }: { message: string }) {
      return <div className="sm-alert sm-alert-danger">{message}</div>;
}

export function EmptyBlock({ label = "Nothing here yet." }: { label?: string }) {
      return <div className="sm-card p-8 text-center text-sm text-[var(--color-ink-soft)]">{label}</div>;
}
