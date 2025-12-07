import React from "react";

// Mapping emoji + color
const moodMap = {
  happy: { emoji: "😄", color: "#facc15" },       // yellow
  sad: { emoji: "😢", color: "#3b82f6" },         // blue
  angry: { emoji: "😡", color: "#ef4444" },       // red
  surprised: { emoji: "😲", color: "#f472b6" },   // pink
  fearful: { emoji: "😱", color: "#8b5cf6" },     // purple
  disgusted: { emoji: "🤢", color: "#10b981" },   // green
  neutral: { emoji: "😐", color: "#6b7280" },     // gray
};

function MoodJournal({ logs }) {
  return (
    <div
      style={{
        width: "360px",
        maxHeight: "320px",
        backgroundColor: "#fff",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        overflowY: "auto",
        marginTop: "20px",
      }}
    >
      <h3 style={{ marginBottom: "10px", fontWeight: "600", fontSize: "16px" }}>
        Mood Journal
      </h3>

      {logs.length === 0 && (
        <p style={{ color: "#6b7280" }}>No mood changes yet</p>
      )}

      {logs.map((entry, index) => {
        const mood = moodMap[entry.mood] || { emoji: "❓", color: "#374151" };
        return (
          <div
            key={index}
            style={{
              borderBottom: "1px solid #d1d5db",
              padding: "8px 0",
              fontSize: "14px",
              color: mood.color, // color-coded
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <strong>{entry.time}</strong> — <span>{mood.emoji} {entry.mood}</span>
          </div>
        );
      })}
    </div>
  );
}

export default MoodJournal;