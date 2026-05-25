import React, { useState } from 'react';

// ============================================
// VARIAN 1: OUTLINE BOOKMARK ICON (Large)
// ============================================
export const BookmarkIconLarge = ({ size = 32, strokeWidth = 2.5 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 4H24C25.1046 4 26 4.89543 26 6V28L16 22L6 28V6C6 4.89543 6.89543 4 8 4Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ============================================
// VARIAN 2: OUTLINE BOOKMARK ICON (Medium)
// ============================================
export const BookmarkIconMedium = ({ size = 24, strokeWidth = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 3H18C19.1046 3 20 3.89543 20 5V21L12 16.5L4 21V5C4 3.89543 4.89543 3 6 3Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ============================================
// VARIAN 3: OUTLINE BOOKMARK ICON (Small)
// ============================================
export const BookmarkIconSmall = ({ size = 20, strokeWidth = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 2H15C16.1046 2 17 2.89543 17 4V17L10 13L3 17V4C3 2.89543 3.89543 2 5 2Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ============================================
// FILLED VERSION (untuk when saved=true)
// ============================================
export const BookmarkIconFilled = ({ size = 24, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 3H18C19.1046 3 20 3.89543 20 5V21L12 16.5L4 21V5C4 3.89543 4.89543 3 6 3Z" />
  </svg>
);

// ============================================
// BUTTON COMPONENT: Save Job (Interactive)
// ============================================
export const SaveJobButton = ({ jobId, size = 24, onSave }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleClick = () => {
    setIsSaved(!isSaved);
    onSave?.(jobId, !isSaved);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        borderRadius: "6px",
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isSaved ? "rgba(255, 193, 7, 0.08)" : "transparent",
        border: `1px solid ${isSaved ? "#FFC107" : "#e0e0e0"}`,
        cursor: "pointer",
        color: isSaved ? "#FFC107" : "#666",
        transition: "all 0.15s ease",
        padding: 0,
      }}
      onMouseEnter={(e) => {
        if (!isSaved) {
          e.currentTarget.style.backgroundColor = "#fafafa";
          e.currentTarget.style.borderColor = "#999";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSaved) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderColor = "#e0e0e0";
        }
      }}
      title={isSaved ? "Remove from saved" : "Save job"}
    >
      {isSaved ? (
        <BookmarkIconFilled size={size} color="#FFC107" />
      ) : (
        <BookmarkIconMedium size={size} />
      )}
    </button>
  );
};

// ============================================
// BUTTON COMPONENT: Save Job (Outline style)
// ============================================
export const SaveJobButtonOutline = ({ jobId, size = 20, onSave }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleClick = () => {
    setIsSaved(!isSaved);
    onSave?.(jobId, !isSaved);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        borderRadius: "6px",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: isSaved ? "#FFC107" : "transparent",
        border: `1.5px solid ${isSaved ? "#FFC107" : "#0052CC"}`,
        color: isSaved ? "white" : "#0052CC",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isSaved ? "#FFB300" : "#F8FBFF";
        e.currentTarget.style.borderColor = "#003BAA";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isSaved ? "#FFC107" : "transparent";
        e.currentTarget.style.borderColor = isSaved ? "#FFC107" : "#0052CC";
      }}
      title={isSaved ? "Remove from saved" : "Save job"}
    >
      {isSaved ? (
        <BookmarkIconFilled size={size} color="white" />
      ) : (
        <BookmarkIconSmall size={size} />
      )}
      <span>{isSaved ? "Saved" : "Save"}</span>
    </button>
  );
};

// ============================================
// DEMO COMPONENT
// ============================================
export default function BookmarkDemo() {
  return (
    <div style={{ padding: "40px", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: "24px", fontSize: "24px", fontWeight: "600" }}>
        Bookmark Icon Variants
      </h1>

      {/* Icon Sizes */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "12px" }}>
          Icon Sizes
        </h2>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <BookmarkIconLarge size={32} strokeWidth={2.5} />
            <span style={{ fontSize: "12px", color: "#999" }}>32px (Large)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <BookmarkIconMedium size={24} strokeWidth={2} />
            <span style={{ fontSize: "12px", color: "#999" }}>24px (Medium)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <BookmarkIconSmall size={20} strokeWidth={1.8} />
            <span style={{ fontSize: "12px", color: "#999" }}>20px (Small)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <BookmarkIconFilled size={24} color="#FFC107" />
            <span style={{ fontSize: "12px", color: "#999" }}>24px (Filled)</span>
          </div>
        </div>
      </section>

      {/* Icon Button Component */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "12px" }}>
          Icon Button (Minimal)
        </h2>
        <SaveJobButton jobId="job_001" size={20} />
      </section>

      {/* Outline Button Component */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "12px" }}>
          Button with Text
        </h2>
        <SaveJobButtonOutline jobId="job_001" size={18} />
      </section>

      {/* Color Variants */}
      <section>
        <h2 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "12px" }}>
          Color Variants
        </h2>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ color: "#666" }}>
              <BookmarkIconMedium size={24} />
            </div>
            <span style={{ fontSize: "12px", color: "#999" }}>#666 (Gray)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ color: "#0052CC" }}>
              <BookmarkIconMedium size={24} />
            </div>
            <span style={{ fontSize: "12px", color: "#999" }}>#0052CC (Blue)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ color: "#FFC107" }}>
              <BookmarkIconMedium size={24} />
            </div>
            <span style={{ fontSize: "12px", color: "#999" }}>#FFC107 (Amber)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ color: "#D32F2F" }}>
              <BookmarkIconMedium size={24} />
            </div>
            <span style={{ fontSize: "12px", color: "#999" }}>#D32F2F (Red)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
