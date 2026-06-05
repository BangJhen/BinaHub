"use client";

import { useEffect } from "react";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div style={{ background: "var(--color-background-tertiary)", padding: "2rem", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--color-background-primary)", padding: "2rem", borderRadius: "12px", textAlign: "center", maxWidth: "400px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <i className="ti ti-alert-circle" style={{ fontSize: "48px", color: "var(--color-text-danger)", marginBottom: "1rem" }} />
        <h2 style={{ margin: "0 0 1rem", fontSize: "20px" }}>Oops! Terjadi Kesalahan</h2>
        <p style={{ margin: "0 0 1.5rem", color: "var(--color-text-secondary)", fontSize: "14px" }}>
          Kami mengalami kendala saat memuat dashboard. Silakan coba lagi.
        </p>
        <button
          onClick={() => reset()}
          style={{
            background: "var(--color-background-info)",
            color: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: "6px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "opacity 0.2s"
          }}
          onMouseOver={e => e.currentTarget.style.opacity = "0.9"}
          onMouseOut={e => e.currentTarget.style.opacity = "1"}
        >
          Muat Ulang
        </button>
      </div>
    </div>
  );
}