import type { CollectionEntry } from "astro:content";

/**
 * @Description: Blog相关的类型定义
 * @Author: 小钦var
 * @Date: 2025/1/6 16:22
 */
export type BlogType = {
  title: string;
  id: string;
  desc?: string;
  modifyTime: number;
};
