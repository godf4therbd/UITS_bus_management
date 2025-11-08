import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function App() {
  const [result, setResult] = useState("");

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1.5rem", textAlign: "center" }}>
      <h1>Scan Bus QR</h1>
      <div style={{ borderRadius: "1rem", overflow: "hidden", background: "#000" }}>
        <Scanner
          onScan={(text) => {
            if (text && text !== result) {
              setResult(text);
              console.log("Scanned:", text);
            }
          }}
          onError={(err) => console.error(err)}
          components={{ finder: true }}
        />
      </div>
      {result ? (
        <p style={{ marginTop: "1rem", wordBreak: "break-all" }}>{result}</p>
      ) : (
        <p style={{ marginTop: "1rem", color: "#777" }}>Scanning…</p>
      )}
    </div>
  );
}
