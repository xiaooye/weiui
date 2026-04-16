import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
  },
});

const nextConfig = {
  pageExtensions: ["tsx", "mdx"],
};

export default withMDX(nextConfig);
