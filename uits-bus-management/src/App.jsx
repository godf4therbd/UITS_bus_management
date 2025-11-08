// src/App.jsx
import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

export default function App() {
  const [result, setResult] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleScan = (text) => {
    if (!text) return;
    if (text === result) return;
    setResult(text);
    console.log("Scanned QR:", text);
  };

  const handleError = (err) => {
    console.error(err);
    setErrorMsg("Camera error — please allow camera access.");
  };

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: "1rem" }}>Scan Bus QR</h1>
      <div
        style={{
          borderRadius: "1rem",
          overflow: "hidden",
          background: "#000",
        }}
      >
        <Scanner
          onScan={(detected) => handleScan(detected)}
          onError={handleError}
          components={{ finder: true }}
        />
      </div>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      {result ? (
        <div
          style={{
            marginTop: "1.5rem",
            background: "#fff",
            padding: "1rem",
            borderRadius: "0.75rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h2>Scanned Data</h2>
          <p style={{ wordBreak: "break-all" }}>{result}</p>
        </div>
      ) : (
        <p style={{ marginTop: "1rem", color: "#777" }}>Scanning…</p>
      )}
    </div>
  );
}
