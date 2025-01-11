import { useState } from "react";
import { formatViews } from "../lib/client-ssg.runtime.ts";

const BlogPostViews = () => {
  const [views, _setViews] = useState<number>(0);
  return <span className="ml-2 align-baseline capsize">{formatViews(views)}</span>;
};

export default BlogPostViews;
