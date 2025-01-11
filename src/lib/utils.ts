import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import path from "node:path";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatViews = (views: number) => {
  return new Intl.NumberFormat("en-US").format(views);
};

/**
 * 根据文件路径获取文件名作为标题
 * @param filePath
 */
export const getTitleByPath = (filePath: string) => {
  const ext = path.extname(filePath);
  return path.basename(filePath, ext);
};
