export function AppIcon({ name }: { name: string }) {
  if (name === "briefcase") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M3 12h18" />
      </svg>
    );
  }

  if (name === "radar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
        <path d="M12 12l6-4" />
      </svg>
    );
  }

  if (name === "clipboard-check") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <rect x="5" y="5" width="14" height="17" rx="2" />
        <path d="m8 14 2 2 4-4" />
      </svg>
    );
  }

  if (name === "user-plus") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10" cy="8" r="3" />
        <path d="M4 19a6 6 0 0 1 12 0" />
        <path d="M19 8v6" />
        <path d="M16 11h6" />
      </svg>
    );
  }

  if (name === "file-plus") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
        <path d="M14 2v5h5" />
        <path d="M12 11v6" />
        <path d="M9 14h6" />
      </svg>
    );
  }

  if (name === "link-match") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 14a4 4 0 0 1 0-6l1-1a4 4 0 0 1 6 6l-1 1" />
        <path d="M14 10a4 4 0 0 1 0 6l-1 1a4 4 0 0 1-6-6l1-1" />
      </svg>
    );
  }

  if (name === "calendar-check") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    );
  }

  if (name === "store") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10h16" />
        <path d="M5 10v9h14v-9" />
        <path d="m3 10 2-5h14l2 5" />
        <path d="M10 19v-5h4v5" />
      </svg>
    );
  }

  if (name === "worker") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 11V9a6 6 0 0 1 12 0v2" />
        <rect x="5" y="11" width="14" height="4" rx="1" />
        <path d="M12 15v3" />
        <path d="M7 21a5 5 0 0 1 10 0" />
      </svg>
    );
  }

  if (name === "shield-check") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (name === "chart-up") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19h16" />
        <path d="m6 15 4-4 3 3 5-6" />
        <path d="M18 8h2v2" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2" />
        <path d="M3 19a6 6 0 0 1 12 0" />
        <path d="M14 19a4 4 0 0 1 7 0" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
