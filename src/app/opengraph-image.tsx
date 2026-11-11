import { ImageResponse } from "next/og";

export const alt = "Launchly — Websites that keep working";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#e9e9e6",
          padding: 64,
          color: "#141414",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 700 }}>
          <div style={{ width: 44, height: 44, background: "#141414", borderRadius: 8, display: "flex", position: "relative" }}>
            <div style={{ position: "absolute", left: 11, top: 8, width: 8, height: 28, background: "#e9e9e6" }} />
            <div style={{ position: "absolute", left: 11, top: 29, width: 22, height: 7, background: "#e9e9e6" }} />
            <div style={{ position: "absolute", left: 25, top: 9, width: 11, height: 11, borderRadius: 99, background: "#ff5b1f" }} />
          </div>
          Launchly
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 128, fontWeight: 800, letterSpacing: -6, lineHeight: 0.9 }}>
          <span>Websites that</span>
          <span style={{ color: "#9a9a96" }}>keep working.</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#5f5f5b" }}>
          <span>Website development studio</span>
          <span style={{ color: "#ff5b1f" }}>● 12 months of care included</span>
        </div>
      </div>
    ),
    size,
  );
}
