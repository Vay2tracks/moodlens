import React from "react";
import WebcamMood from "./components/WebcamMood";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-slate-100 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">MoodLens</h1>
      <WebcamMood />
    </div>
  );
}

export default App;