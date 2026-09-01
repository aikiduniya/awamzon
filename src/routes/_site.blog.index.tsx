import { createFileRoute } from "@tanstack/react-router";
import { CmsLink } from "@/components/site/CmsLink";
import { getBlogPosts, getSettings } from "@/lib/cms.functions";
import { buildMeta } from "@/lib/seo";
import { group } from "@/lib/cms-types";

export const Route = createFileRoute("/_site/blog/")({
  loader: async () => {
    const [settings, posts] = await Promise.all([getSettings(), getBlogPosts()]);
    return { settings, posts };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Blog" }] };
    const store = group(loaderData.settings, "store", { name: "Store" });
    return buildMeta(loaderData.settings, {
      title: `Journal | ${store.name}`,
      description: `Stories, guides and product news from ${store.name}.`,
      path: "/blog",
    });
  },
  component: BlogIndex,
});

function BlogIndex() {
  const { posts } = Route.useLoaderData();

  return (
    <div className="container-site py-12 space-y-8">
      <header>
        <h1 className="text-4xl">Journal</h1>
        <p className="mt-2 text-muted-foreground">Stories, guides and news.</p>
      </header>
      {posts.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No posts published yet.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id}>
              <CmsLink to={`/blog/${post.slug}`} className="group block">
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.cover_alt ?? ""}
                    loading="lazy"
                    className="mb-3 aspect-video w-full rounded-lg object-cover"
                  />
                )}
                <h2 className="text-lg font-medium group-hover:underline">{post.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
              </CmsLink>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
