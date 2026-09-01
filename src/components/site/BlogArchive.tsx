import { BlogCard, Breadcrumbs, type BlogCardPost } from "./BlogList";
import { CtaSection } from "./CtaSection";
import { blogSettings } from "@/lib/blog";
import { buttonSettings } from "@/lib/buttons";
import type { SettingsMap } from "@/lib/cms-types";
import { siteRouteApi } from "@/routes/_site";

/** Shared listing layout for category / tag / author archives. */
export function BlogArchive({
  settings,
  posts,
  title,
  intro,
  crumb,
}: {
  settings: SettingsMap;
  posts: BlogCardPost[];
  title: string;
  intro: string;
  crumb: string;
}) {
  const config = siteRouteApi.useLoaderData();
  const blog = blogSettings(settings);
  const buttons = buttonSettings(settings);

  return (
    <>
      <div className="container-site py-12 space-y-8">
        {blog.showBreadcrumbs ? (
          <Breadcrumbs
            trail={[{ label: "Home", to: "/" }, { label: blog.listTitle, to: "/blog" }, { label: `${crumb}: ${title}` }]}
          />
        ) : null}
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{crumb}</p>
          <h1 className="mt-2 font-heading text-4xl capitalize">{title}</h1>
          {intro ? <p className="mt-3 text-muted-foreground">{intro}</p> : null}
        </header>
        {posts.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">{blog.emptyText}</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} blog={blog} buttons={buttons} />
            ))}
          </div>
        )}
      </div>
      <CtaSection config={config} location="blog" />
    </>
  );
}
