import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Callout from "./Callout";
import ComparisonTable from "./ComparisonTable";
import CalculatorCTA from "./CalculatorCTA";

const components = {
  Callout,
  ComparisonTable,
  CalculatorCTA,
};

interface Props {
  source: string;
}

export default function ArticleBody({ source }: Props) {
  return (
    <div className="prose-blog text-[17px] leading-[1.8] text-slate-800">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        }}
      />
    </div>
  );
}
