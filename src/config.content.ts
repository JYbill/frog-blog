import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blogsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blogs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    image: z.string(),
  }),
});

const snippetsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/snippets" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      image: image(),
    }),
});

export const collections = {
  blogs: blogsCollection,
  snippets: snippetsCollection,
};
