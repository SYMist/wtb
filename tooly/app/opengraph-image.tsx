import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            marginBottom: 24,
          }}
        >
          Tooly
        </div>
        <div
          style={{
            fontSize: 36,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 48,
          }}
        >
          생활 계산기 &amp; 도구 모음
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["금융", "건강", "변환", "날짜", "생활"].map((cat) => (
            <div
              key={cat}
              style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: "12px 24px",
                fontSize: 24,
                color: "white",
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
