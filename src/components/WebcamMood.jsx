import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import MoodJournal from "./MoodJournal";

// Map moods to emojis and colors
const moodMap = {
  happy: { emoji: "😄", color: "#facc15" }, // yellow
  sad: { emoji: "😢", color: "#3b82f6" }, // blue
  angry: { emoji: "😡", color: "#ef4444" }, // red
  surprised: { emoji: "😲", color: "#f472b6" }, // pink
  fearful: { emoji: "😱", color: "#8b5cf6" }, // purple
  disgusted: { emoji: "🤢", color: "#10b981" }, // green
  neutral: { emoji: "😐", color: "#6b7280" }, // gray
};

function WebcamMood() {
  const videoRef = useRef(null);
  const [emotion, setEmotion] = useState("Detecting...");
  const [logs, setLogs] = useState(() => {
    return JSON.parse(localStorage.getItem("moodLogs")) || [];
  });

  // Load models and start webcam
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        startVideo();
      } catch (err) {
        console.error("Error loading models:", err);
      }
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Camera error:", err));
    };

    loadModels();
  }, []);

  // Detect emotions continuously
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detection && detection.expressions) {
        const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
        const detectedMood = sorted[0][0];

        if (detectedMood !== emotion) {
          setEmotion(detectedMood);

          const newEntry = {
            time: new Date().toLocaleTimeString(),
            mood: detectedMood,
          };

          setLogs((prev) => {
            const updated = [newEntry, ...prev];
            localStorage.setItem("moodLogs", JSON.stringify(updated));
            return updated;
          });
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [emotion]);

  const currentMood = moodMap[emotion] || { emoji: "❓", color: "#374151" };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        paddingBottom: "40px",
      }}
    >
      {/* Current Mood */}
      <h2 style={{ fontSize: "22px", fontWeight: "600", color: currentMood.color, marginBottom: "12px" }}>
        Current Mood: <span style={{ textTransform: "capitalize" }}>{emotion} {currentMood.emoji}</span>
      </h2>

      {/* Webcam */}
      <div
        style={{
          borderRadius: "12px",
          border: `3px solid ${currentMood.color}`,
          boxShadow: `0 0 20px ${currentMood.color}55`, // subtle glow
          overflow: "hidden",
          marginTop: "10px",
          transition: "box-shadow 0.3s, border 0.3s",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          width="360"
          height="260"
          style={{ borderRadius: "12px" }}
        />
      </div>

      {/* Mood Journal */}
      <MoodJournal logs={logs} />
    </div>
  );
}

export default WebcamMood;