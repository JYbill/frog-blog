import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { HomeConfig } from "@/config";

export async function GET(context: APIContext) {
  const blogs = await getCollection("blogs");
  const sortedPosts = blogs.sort((a, b) => Number(new Date(b.data.date)) - Number(new Date(a.data.date)));
  return rss({
    title: HomeConfig.authorName,
    description: HomeConfig.introduction,
    site: context.site || "",
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>zh-cn</language>`,
  });
}
