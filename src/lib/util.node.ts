import path from "node:path";

/**
 * 根据文件路径获取文件名作为标题
 * @param filePath
 */
export const getTitleByPath = (filePath: string) => {
  const ext = path.extname(filePath);
  return path.basename(filePath, ext);
};
