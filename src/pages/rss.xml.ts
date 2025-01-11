import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { HomeConfig } from "@/config";
import type { BlogType } from "@/types/blog";
import { stat } from "node:fs/promises";
import { getTitleByPath } from "@/lib/util.node.ts";

export async function GET(context: APIContext) {
  const list = await getCollection("blogs");
  const blogs: BlogType[] = [];
  for (const blog of list) {
    const filePath = blog.filePath as string;
    const stats = await stat(filePath);
    blogs.push({
      title: getTitleByPath(filePath),
      id: blog.id,
      desc: blog.data.description,
      modifyTime: stats.mtimeMs,
    });
  }
  const sortedPosts = blogs.sort((a, b) => Number(new Date(b.modifyTime)) - Number(new Date(a.modifyTime)));
  return rss({
    title: HomeConfig.authorName,
    description: HomeConfig.introduction,
    site: context.site || "",
    items: sortedPosts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.modifyTime),
      description: post.desc,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>zh-cn</language>`,
  });
}
