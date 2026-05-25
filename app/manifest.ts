import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rapper Tool — ラップ歌詞スタジオ",
    short_name: "Rapper Tool",
    description: "韻候補 × AI × 韻密度分析で日本語ラップ歌詞を生成",
    start_url: "/",
    display: "standalone",
    background_color: "#14121c",
    theme_color: "#14121c",
    orientation: "portrait",
    lang: "ja",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
