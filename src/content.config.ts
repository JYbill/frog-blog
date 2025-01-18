import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blogsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blogs" }),
  schema: z.object({
    description: z.string().optional(),
  }),
});

export const collections = {
  blogs: blogsCollection,
};
