import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

function WebcamMood({ onMoodChange }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models"; // models in public/models
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        startVideo();
      } catch (err) {
        console.error("Error loading face-api models:", err);
        setError(true);
        setLoading(false);
      }
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" }, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
          setError(true);
          setLoading(false);
        });
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (loading || error) return;

    const intervalId = setInterval(async () => {
      if (!videoRef.current) return;

      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections && detections.expressions) {
        const expressions = detections.expressions;
        const mood = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        );
        onMoodChange(mood);
      } else {
        onMoodChange("neutral");
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [loading, error, onMoodChange]);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      <div
        style={{
          width: "360px",
          height: "270px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          color: "#6b7280",
        }}
      >
        {loading && !error && "Loading camera..."}
        {error && "Camera not available. Please allow camera or use a supported device."}
        {!loading && !error && <video ref={videoRef} width="360" height="270" muted />}
      </div>
    </div>
  );
}

export default WebcamMood;