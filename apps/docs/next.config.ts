import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: {
            light: "vitesse-light",
            dark: "vitesse-dark",
          },
          keepBackground: false,
        },
      ],
    ],
  },
});

const nextConfig = {
  pageExtensions: ["tsx", "mdx"],
};

export default withMDX(nextConfig);
