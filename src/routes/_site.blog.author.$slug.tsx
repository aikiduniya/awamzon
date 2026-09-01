import { createFileRoute } from "@tanstack/react-router";
import { getBlogPosts, getSettings } from "@/lib/cms.functions";
import { buildMeta } from "@/lib/seo";
import { group } from "@/lib/cms-types";
import { authorSlug, blogSettings } from "@/lib/blog";
import { BlogArchive } from "@/components/site/BlogArchive";

export const Route = createFileRoute("/_site/blog/author/$slug")({
  loader: async ({ params }) => {
    const [settings, all] = await Promise.all([getSettings(), getBlogPosts()]);
    const posts = all.filter((p) => authorSlug(p) === params.slug);
    const name = posts[0]?.author ?? params.slug.replace(/-/g, " ");
    const bio = posts[0]?.author_bio ?? "";
    return { settings, posts, name, bio };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Author" }] };
    const store = group(loaderData.settings, "store", { name: "Store" });
    const blog = blogSettings(loaderData.settings);
    return buildMeta(loaderData.settings, {
      title: `${loaderData.name} | ${store.name}`,
      description: loaderData.bio || blog.authorIntro.replace("{name}", loaderData.name),
      path: `/blog/author/${params.slug}`,
      image: loaderData.posts[0]?.cover_image ?? undefined,
    });
  },
  component: AuthorArchive,
});

function AuthorArchive() {
  const { settings, posts, name, bio } = Route.useLoaderData();
  const blog = blogSettings(settings);
  return (
    <BlogArchive
      settings={settings}
      posts={posts}
      title={name}
      intro={bio || blog.authorIntro.replace("{name}", name)}
      crumb="Author"
    />
  );
}
