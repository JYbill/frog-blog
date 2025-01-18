/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm" {
  import { gsap } from "gsap";
  export default gsap;
}

declare module "https://cdn.jsdelivr.net/npm/giscus@1.6.0/+esm" {
  import giscus from "giscus";
  export default giscus;
}

declare module "reading-time/lib/reading-time.js" {
  import readingTime from "reading-time";
  export default readingTime;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
declare namespace App {
  interface Locals extends Runtime {
    otherLocals: {
      test: string;
    };
  }
}
