import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";

const flattenHtmlOutput = {
  name: "flatten-html-output",
  enforce: "post",
  generateBundle(_options, bundle) {
    for (const asset of Object.values(bundle)) {
      if (
        asset.type === "asset" &&
        asset.fileName.startsWith("src/") &&
        asset.fileName.endsWith(".html")
      ) {
        asset.fileName = asset.fileName.replace(/^src\//, "");
      }
    }
  }
};

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const accessCode = env.VITE_INDEX_ACCESS_CODE || process.env.VITE_INDEX_ACCESS_CODE;

  if (!accessCode) {
    console.error("\n[Onboard] BUILD CONFIG ERROR");
    console.error("[Onboard] VITE_INDEX_ACCESS_CODE is not set.");
    console.error("[Onboard] Add VITE_INDEX_ACCESS_CODE to the Webflow Cloud environment variables, then redeploy.\n");
    throw new Error("Missing required environment variable: VITE_INDEX_ACCESS_CODE");
  }

  if (isSsrBuild) {
    return {
      root: "./",
      define: {
        "process.env.VITE_INDEX_ACCESS_CODE": JSON.stringify(accessCode)
      },
      build: {
        rollupOptions: {
          input: resolve(import.meta.dirname, "src/worker.ts")
        }
      }
    };
  }

  return {
    root: ".",
    environments: {
      client: {
        build: {
          outDir: "dist/client",
          emptyOutDir: false,
          rollupOptions: {
            input: {
              main: resolve(import.meta.dirname, "index.html"),
              creator: resolve(import.meta.dirname, "srccreator.html"),
              runner: resolve(import.meta.dirname, "srcrunner.html"),
              admin: resolve(import.meta.dirname, "srcadmin.html"),
              stats: resolve(import.meta.dirname, "srcstats.html")
            }
          }
        }
      }
    },
    plugins: [flattenHtmlOutput]
  };
});
