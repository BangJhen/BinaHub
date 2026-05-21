export default function Loading() {
  return (
    <div style={{ background: "var(--color-background-tertiary)", padding: "1.5rem", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ width: "150px", height: "14px", background: "var(--color-background-secondary)", borderRadius: "4px", marginBottom: "8px" }} />
        <div style={{ width: "250px", height: "32px", background: "var(--color-background-secondary)", borderRadius: "6px" }} />
      </div>

      {/* Stats Skeleton */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "2rem" }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: "100px", background: "var(--color-background-secondary)", borderRadius: "8px" }} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "16px" }}>
        <div style={{ height: "400px", background: "var(--color-background-secondary)", borderRadius: "8px" }} />
        <div style={{ height: "600px", background: "var(--color-background-secondary)", borderRadius: "8px" }} />
      </div>
    </div>
  );
}