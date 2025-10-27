import {
  defineConfig,
  defineDocs,
  defineCollections,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";

export const { docs, meta } = defineDocs({
  dir: "content/docs",
});

export const blog = defineCollections({
  type: "doc",
  dir: "content/blogs",
  async: true,
  schema: frontmatterSchema.extend({
    author: z.string(),
    image: z.string(),
    date: z.string().date().or(z.date()).optional(),
    priority: z.number().default(0),
  }),
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
