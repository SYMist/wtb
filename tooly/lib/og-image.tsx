import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function createBlogOgImage(title: string, excerpt: string, category: string) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: 999,
              padding: "8px 18px",
              fontSize: 20,
              color: "white",
              fontWeight: 600,
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 600,
            }}
          >
            Tooly Blog
          </div>
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            marginBottom: 24,
            lineHeight: 1.25,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.5,
          }}
        >
          {excerpt.length > 100 ? excerpt.slice(0, 100) + "…" : excerpt}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          tooly.deluxo.co.kr/blog
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}

export function createCalculatorOgImage(name: string, description: string, category: string) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: 8,
              padding: "6px 16px",
              fontSize: 20,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Tooly
          </div>
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            marginBottom: 24,
            lineHeight: 1.2,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          tooly.deluxo.co.kr
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
