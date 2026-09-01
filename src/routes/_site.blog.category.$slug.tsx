import { createFileRoute } from "@tanstack/react-router";
import { getBlogPosts, getSettings } from "@/lib/cms.functions";
import { buildMeta } from "@/lib/seo";
import { group } from "@/lib/cms-types";
import { blogSettings, slugifyTerm } from "@/lib/blog";
import { BlogArchive } from "@/components/site/BlogArchive";

export const Route = createFileRoute("/_site/blog/category/$slug")({
  loader: async ({ params }) => {
    const [settings, all] = await Promise.all([getSettings(), getBlogPosts()]);
    const posts = all.filter((p) => p.category && slugifyTerm(p.category) === params.slug);
    const name = posts[0]?.category ?? params.slug.replace(/-/g, " ");
    return { settings, posts, name };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Category" }] };
    const store = group(loaderData.settings, "store", { name: "Store" });
    const blog = blogSettings(loaderData.settings);
    return buildMeta(loaderData.settings, {
      title: `${loaderData.name} articles | ${store.name}`,
      description: blog.categoryIntro.replace("{name}", loaderData.name),
      path: `/blog/category/${params.slug}`,
      image: loaderData.posts[0]?.cover_image ?? undefined,
    });
  },
  component: CategoryArchive,
});

function CategoryArchive() {
  const { settings, posts, name } = Route.useLoaderData();
  const blog = blogSettings(settings);
  return (
    <BlogArchive
      settings={settings}
      posts={posts}
      title={name}
      intro={blog.categoryIntro.replace("{name}", name)}
      crumb="Category"
    />
  );
}
