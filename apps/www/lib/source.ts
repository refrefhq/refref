import { docs, meta, blog as blogPosts } from "@/.source";
import { createMDXSource } from "fumadocs-mdx";
import { loader } from "fumadocs-core/source";
import { attachFile, createOpenAPI } from "fumadocs-openapi/server";
import { icons } from "lucide-react";
import { createElement } from "react";

export const source = loader({
  baseUrl: "/docs",
  icon(icon) {
    if (icon && icon in icons)
      return createElement(icons[icon as keyof typeof icons]);
  },
  source: createMDXSource(docs, meta),
  pageTree: {
    attachFile,
  },
});

export const blog = loader({
  baseUrl: "/blog",
  source: createMDXSource(blogPosts, meta),
});

export const openapi = createOpenAPI();
