import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 96,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 320,
            height: 320,
            borderRadius: 72,
            background: "rgba(168, 85, 247, 0.18)",
            border: "4px solid rgba(168, 85, 247, 0.55)",
            fontSize: 200,
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
