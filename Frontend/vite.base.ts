import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { UserConfigExport } from "vite";

const OutDirRoot = path.resolve("../Backend/src/IAmFara/App/wwwroot/bundles/");

export function getConfig(entry: string, outDirFolder?: string): UserConfigExport {
  return {
    plugins:[react],
    build: {
      minify: true,
      manifest: true,
      outDir: path.join(OutDirRoot, outDirFolder || ""),
      target: "esnext",
      emptyOutDir: false,
      lib: {
        formats: ["es"],
        entry,
        name: "builder",
      },
    },
  };
}
