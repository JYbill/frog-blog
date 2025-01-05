/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm" {
  import { gsap } from "gsap";
  export default gsap;
}
