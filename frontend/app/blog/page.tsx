"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  Tag, 
  MessageSquare 
} from "lucide-react";
import { BLOG_POSTS, BlogPost } from "@/lib/blogData";
import { useAuthModal } from "@/context/AuthModalContext";

const ThemedNav = dynamic(() => import("@/components/ThemedNav"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });

export default function BlogIndexPage() {
  const { openAuth } = useAuthModal();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Weddings", "Corporate", "Parties & Tips"];

  const filteredPosts = selectedCategory === "All"
    ? BLOG_POSTS
    : BLOG_POSTS.filter((post) => post.category === selectedCategory);

  const featuredPost = BLOG_POSTS[0];

  return (
    <>
      <ThemedNav />
      <main className="min-h-screen bg-bg text-text-primary pt-28 pb-20 flex flex-col items-center">
        {/* HERO */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 text-center pt-8 pb-12 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <BookOpen size={14} />
            Event Insights & Guides
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-text-primary leading-tight">
            Tips, Ideas & Inspiration for <br className="hidden sm:inline" />
            <span className="text-accent">Unforgettable Events</span>
          </h1>
          <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            Practical strategies for couples, event planners, and hosts to capture authentic guest memories without app friction.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-accent text-white shadow-sm"
                    : "bg-bg-subtle border border-border text-text-secondary hover:text-text-primary hover:border-border-hover"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* FEATURED POST */}
        {selectedCategory === "All" && featuredPost && (
          <section className="w-full max-w-5xl mx-auto px-4 md:px-8 mb-12">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block bg-surface border border-border hover:border-accent rounded-3xl p-8 sm:p-12 shadow-card transition-all duration-300 hover:shadow-card-hover"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted mb-4">
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent font-bold uppercase tracking-wider">
                  Featured Guide
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {featuredPost.readTime}
                </span>
                <span>•</span>
                <span>{featuredPost.date}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-text-primary font-display group-hover:text-accent transition-colors leading-tight mb-4">
                {featuredPost.title}
              </h2>

              <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-3xl mb-6">
                {featuredPost.excerpt}
              </p>

              <div className="inline-flex items-center gap-2 text-accent font-bold text-sm group-hover:translate-x-1 transition-transform">
                <span>Read Complete Guide</span>
                <ArrowRight size={16} />
              </div>
            </Link>
          </section>
        )}

        {/* ARTICLES GRID */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col justify-between bg-surface border border-border hover:border-border-hover rounded-2xl p-6 sm:p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-bg-subtle border border-border text-text-secondary font-bold uppercase tracking-wider text-[10px]">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-text-primary font-display group-hover:text-accent transition-colors mb-3 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-text-muted font-medium">{post.author.name}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-accent group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 text-center">
          <div className="bg-gradient-to-r from-accent/15 via-purple-500/10 to-accent/15 border border-accent/20 rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-4xl font-black text-text-primary font-display">
              Ready to Collect Every Guest Memory?
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mt-3 leading-relaxed">
              Create your event gallery in under a minute with zero guest app friction.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={() => openAuth("signup")}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent hover:bg-[#B8882F] text-white font-bold text-sm shadow-[0_4px_16px_rgba(200,150,62,0.3)] transition-all cursor-pointer"
              >
                Create Your Free Event
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-4 rounded-full border border-border bg-surface hover:border-accent text-text-primary font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                <span>Talk to Us on WhatsApp</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
