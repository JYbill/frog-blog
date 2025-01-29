import { atom } from "nanostores";

export enum Theme {
  DARK = "dark",
  LIGHT = "light",
}
export const theme = atom(Theme.DARK);
