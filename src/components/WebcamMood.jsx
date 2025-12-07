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
  const [logs, setLogs] = useState(() => JSON.parse(localStorage.getItem("moodLogs")) || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load models and start webcam
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        startVideo();
      } catch (err) {
        console.error("Error loading models:", err);
        setError(true);
        setLoading(false);
      }
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: "user", width: { ideal: 360 }, height: { ideal: 260 } },
          audio: false,
        })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Camera error:", err);
          setError(true);
          setLoading(false);
        });
    };

    loadModels();
  }, []);

  // Detect emotions continuously
  useEffect(() => {
    if (loading || error) return;

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
    }, 1000);

    return () => clearInterval(interval);
  }, [emotion, loading, error]);

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
      <h2
        style={{
          fontSize: "22px",
          fontWeight: "600",
          color: currentMood.color,
          marginBottom: "12px",
        }}
      >
        Current Mood:{" "}
        <span style={{ textTransform: "capitalize" }}>
          {emotion} {currentMood.emoji}
        </span>
      </h2>

      {/* Webcam Box */}
      <div
        style={{
          borderRadius: "12px",
          border: `3px solid ${currentMood.color}`,
          boxShadow: `0 0 20px ${currentMood.color}55`, // subtle glow
          overflow: "hidden",
          marginTop: "10px",
          transition: "box-shadow 0.3s, border 0.3s",
          width: "360px",
          height: "260px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f3f4f6",
          color: "#6b7280",
        }}
      >
        {loading && !error && "Loading camera..."}
        {error && "Camera not available. Please allow camera or use a supported device."}
        {!loading && !error && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            width="360"
            height="260"
            style={{ borderRadius: "12px" }}
          />
        )}
      </div>

      {/* Mood Journal */}
      <MoodJournal logs={logs} />
    </div>
  );
}

export default WebcamMood;