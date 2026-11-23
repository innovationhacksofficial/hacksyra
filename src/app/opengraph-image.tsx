import { ImageResponse } from "next/og";

export const alt = "HACKSYRA — Discover, Build & Host Hackathons";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #1565D8 0%, #0B3E86 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, fontWeight: 800 }}>
          <span style={{ background: "#FFFFFF", color: "#1565D8", padding: "8px 18px", borderRadius: 14 }}>IH</span>
          <span>HACKSYRA</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 64, fontWeight: 800, lineHeight: 1.08 }}>
            <span>Discover hackathons.</span>
            <span>Build together. Host anyone.</span>
          </div>
          <div style={{ fontSize: 28, color: "#DCE9FF" }}>
            An Innovation Hacks Platform — Real-time Events, Teams, Judging &amp; Certificates
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#BAE6FD" }}>innovationhacks.in</div>
      </div>
    ),
    size
  );
}

