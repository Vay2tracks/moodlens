import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

function WebcamMood({ onMoodChange }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load face-api models
    const loadModels = async () => {
      const MODEL_URL = "/models"; // make sure models are in public/models
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      startVideo();
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: "user" }, // front camera for mobile
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
          console.error("Error accessing camera:", err);
          setLoading(false);
        });
    };

    loadModels();
  }, []);

  useEffect(() => {
    let intervalId;

    const detectMood = async () => {
      if (videoRef.current) {
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
      }
    };

    if (!loading) {
      intervalId = setInterval(detectMood, 1000);
    }

    return () => clearInterval(intervalId);
  }, [loading, onMoodChange]);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      {loading ? (
        <p>Loading camera...</p>
      ) : (
        <video
          ref={videoRef}
          width="360"
          height="270"
          style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          muted
        />
      )}
    </div>
  );
}

export default WebcamMood;