import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import theme from "./dark-theme.json";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";
import { visualizer } from "rollup-plugin-visualizer";

const prettyCodeOptions = {
  theme,
  onVisitHighlightedLine(node) {
    node?.properties?.className?.push("highlight-line");
  },
  onVisitHighlightedChars(node) {
    node?.properties?.className
      ? node.properties.className.push("highlighted-chars")
      : (node.properties.className = ["highlighted-chars"]);
  },
  tokensMap: {},
};

// https://astro.build/config
export default defineConfig({
  site: "https://blog.jybill.top",
  vite: {
    build: {
      minify: false,
    },
    ssr: {
      external: ["node:fs/promises", "node:path", "node:buffer", "./src/lib/utils.ts"],
      noExternal: ["readingTime"],
    },
    plugins: [
      visualizer({
        emitFile: true,
        filename: "stats.html",
      }),
    ],
  },
  integrations: [tailwind(), react(), mdx(), sitemap()],
  scopedStyleStrategy: "class",
  markdown: {
    syntaxHighlight: false,
    extendDefaultPlugins: true,
    rehypePlugins: [
      [rehypePrettyCode, prettyCodeOptions],
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ["anchor"],
          },
        },
      ],
    ],
    shikiConfig: {
      // @ts-ignore
      theme,
    },
  },

  // SSG优先
  output: "static",
  adapter: cloudflare({
    imageService: "passthrough",
    platformProxy: {
      enabled: true,
      configPath: "wrangler.json",
      experimentalRegistry: false,
      persist: {
        path: ".cache/v3",
      },
    },
  }),
});
