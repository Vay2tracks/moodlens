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
  const [cameraError, setCameraError] = useState(false);
  const [modelError, setModelError] = useState(false);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log("Loading face-api models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        console.log("Models loaded successfully");
        setModelError(false);
        startVideo();
      } catch (err) {
        console.error("Error loading models:", err);
        setModelError(true);
        setLoading(false);
      }
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user", width: { ideal: 360 }, height: { ideal: 260 } }, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          console.log("Camera stream started");
          setCameraError(false);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Camera error:", err);
          setCameraError(true);
          setLoading(false);
        });
    };

    loadModels();
  }, []);

  // Detect emotions
  useEffect(() => {
    if (loading || cameraError || modelError) return;

    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      try {
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
      } catch (err) {
        console.error("Face detection error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [emotion, loading, cameraError, modelError]);

  const currentMood = moodMap[emotion] || { emoji: "❓", color: "#374151" };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", paddingBottom: "40px" }}>
      {/* Current Mood */}
      <h2 style={{ fontSize: "22px", fontWeight: "600", color: currentMood.color, marginBottom: "12px" }}>
        Current Mood: <span style={{ textTransform: "capitalize" }}>{emotion} {currentMood.emoji}</span>
      </h2>

      {/* Webcam Box */}
      <div
        style={{
          width: "360px",
          height: "260px",
          borderRadius: "12px",
          border: `3px solid ${currentMood.color}`,
          boxShadow: `0 0 20px ${currentMood.color}55`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f3f4f6",
          color: "#6b7280",
          marginTop: "10px",
        }}
      >
        {loading && !cameraError && !modelError && "Loading..."}
        {cameraError && "Camera not available. Check permissions or device."}
        {modelError && "Model failed to load. Check console for errors."}
        {!loading && !cameraError && !modelError && (
          <video ref={videoRef} autoPlay muted playsInline width="360" height="260" style={{ borderRadius: "12px" }} />
        )}
      </div>

      {/* Mood Journal */}
      <MoodJournal logs={logs} />
    </div>
  );
}

export default WebcamMood;