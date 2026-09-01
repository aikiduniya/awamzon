import { createFileRoute } from "@tanstack/react-router";
import { getBlogPosts, getSettings } from "@/lib/cms.functions";
import { buildMeta } from "@/lib/seo";
import { group } from "@/lib/cms-types";
import { blogSettings, slugifyTerm } from "@/lib/blog";
import { BlogArchive } from "@/components/site/BlogArchive";

export const Route = createFileRoute("/_site/blog/tag/$slug")({
  loader: async ({ params }) => {
    const [settings, all] = await Promise.all([getSettings(), getBlogPosts()]);
    const posts = all.filter((p) => ((p.tags ?? []) as string[]).some((t) => slugifyTerm(t) === params.slug));
    const name =
      ((posts[0]?.tags ?? []) as string[]).find((t) => slugifyTerm(t) === params.slug) ??
      params.slug.replace(/-/g, " ");
    return { settings, posts, name };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Tag" }] };
    const store = group(loaderData.settings, "store", { name: "Store" });
    const blog = blogSettings(loaderData.settings);
    return buildMeta(loaderData.settings, {
      title: `${loaderData.name} | ${store.name}`,
      description: blog.tagIntro.replace("{name}", loaderData.name),
      path: `/blog/tag/${params.slug}`,
      image: loaderData.posts[0]?.cover_image ?? undefined,
    });
  },
  component: TagArchive,
});

function TagArchive() {
  const { settings, posts, name } = Route.useLoaderData();
  const blog = blogSettings(settings);
  return (
    <BlogArchive
      settings={settings}
      posts={posts}
      title={name}
      intro={blog.tagIntro.replace("{name}", name)}
      crumb="Tag"
    />
  );
}
