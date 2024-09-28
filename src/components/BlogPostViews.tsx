import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { formatViews } from "../lib/utils";

const BlogPostViews = ({ slug, className, increment }: { slug: string; className?: string; increment?: boolean }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const [views, setViews] = useState<number>(0);

  return (
    <span className={className ? className : "ml-2 align-baseline capsize"} ref={ref}>
      {formatViews(views)}
    </span>
  );
};

export default BlogPostViews;
