import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #14121c 0%, #1e1a2e 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "rgba(168, 85, 247, 0.18)",
            border: "3px solid rgba(168, 85, 247, 0.55)",
            fontSize: 72,
            color: "#c084fc",
            fontWeight: 700,
          }}
        >
          ⚡
        </div>
      </div>
    ),
    { ...size },
  );
}
