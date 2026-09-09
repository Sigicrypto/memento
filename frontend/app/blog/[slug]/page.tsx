import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Share2, 
  ArrowRight, 
  Sparkles,
  MessageSquare
} from "lucide-react";
import { BLOG_POSTS, BlogPost } from "@/lib/blogData";
import { Metadata } from "next";
import ThemedNav from "@/components/ThemedNav";
import Footer from "@/components/sections/Footer";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Article Not Found | Memento Blog",
    };
  }

  return {
    title: `${post.title} | Memento`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-bg text-text-primary pt-28 pb-20 flex flex-col items-center">
        {/* ARTICLE HEADER */}
        <article className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-8">
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-accent transition-colors"
            >
              <ArrowLeft size={14} /> Back to All Articles
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted mb-4">
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent font-bold uppercase tracking-wider text-[11px]">
              {post.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {post.readTime}
            </span>
            <span>•</span>
            <span>{post.date}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-text-primary font-display leading-tight mb-6">
            {post.title}
          </h1>

          <p className="text-text-secondary text-base sm:text-xl leading-relaxed mb-8">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-3 py-4 border-y border-border mb-10">
            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-sm">
              {post.author.name[0]}
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary">{post.author.name}</div>
              <div className="text-xs text-text-muted">{post.author.role}</div>
            </div>
          </div>

          {/* KEY TAKEAWAYS BOX */}
          {post.keyTakeaways && (
            <div className="bg-bg-subtle border border-border rounded-2xl p-6 sm:p-8 mb-12 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-accent mb-4">
                <Sparkles size={16} />
                Key Takeaways
              </div>
              <ul className="space-y-3">
                {post.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
                    <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ARTICLE BODY SECTIONS */}
          <div className="space-y-10 text-text-primary leading-relaxed">
            {post.content.map((sec, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-black text-text-primary font-display pt-2">
                  {sec.heading}
                </h2>
                {sec.body.map((para, pIdx) => (
                  <p key={pIdx} className="text-text-secondary text-base sm:text-lg leading-relaxed">
                    {para}
                  </p>
                ))}
              </section>
            ))}
          </div>

          {/* IN-ARTICLE CTA BOX */}
          <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-surface border border-border shadow-card text-center">
            <h3 className="text-2xl font-black text-text-primary font-display mb-2">
              Ready to Experience Memento Live?
            </h3>
            <p className="text-text-secondary text-sm sm:text-base max-w-lg mx-auto mb-6">
              Create your event in under 30 seconds or chat with our founder directly for venue and AV advice.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/create"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm shadow-sm transition-all"
              >
                Create Free Event
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-border bg-bg-subtle hover:border-accent text-text-primary font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                <span>Talk on WhatsApp</span>
              </Link>
            </div>
          </div>

          {/* RELATED POSTS */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border">
              <h3 className="text-xl font-bold text-text-primary font-display mb-6">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="p-6 rounded-2xl bg-surface border border-border hover:border-accent transition-all shadow-sm"
                  >
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent mb-2 block">
                      {rel.category}
                    </span>
                    <h4 className="font-bold text-base text-text-primary mb-2 leading-snug">
                      {rel.title}
                    </h4>
                    <p className="text-text-secondary text-xs line-clamp-2 leading-relaxed">
                      {rel.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
