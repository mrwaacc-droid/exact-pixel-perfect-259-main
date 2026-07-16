import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, CheckCircle2, Clock, ListChecks, UserRound } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Footer } from "@/components/landing/Footer";
import {
  getBlogPost,
  getBlogPostHref,
  getRelatedPosts,
  type BlogSection,
} from "@/lib/blog-content";
import "@/styles/landing.css";

export interface BlogPostMeta {
  slug?: string;
  title: string;
  description: string;
  keywords?: string;
  publishDate: string;
  readTime: string;
  author?: string;
  audience?: string;
  wordCount?: number;
  outcomes?: string[];
  sections?: BlogSection[];
}

function normaliseHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function BlogLayout({ meta, children }: { meta: BlogPostMeta; children: ReactNode }) {
  const registryPost = meta.slug ? getBlogPost(meta.slug) : undefined;
  const articleMeta = {
    ...registryPost,
    ...meta,
    author: meta.author ?? registryPost?.author,
    audience: meta.audience ?? registryPost?.audience,
    wordCount: meta.wordCount ?? registryPost?.wordCount,
    outcomes: meta.outcomes ?? registryPost?.outcomes ?? [],
    sections: meta.sections ?? registryPost?.sections ?? [],
  };
  const relatedPosts = articleMeta.slug ? getRelatedPosts(articleMeta.slug) : [];
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = contentRef.current;
    if (!root || !articleMeta.sections.length) return;

    const headings = Array.from(root.querySelectorAll("h2"));
    const usedHeadings = new Set<Element>();

    articleMeta.sections.forEach((section, index) => {
      const sectionTitle = normaliseHeading(section.title);
      const matchingHeading =
        headings.find((heading) => {
          if (usedHeadings.has(heading)) return false;
          return normaliseHeading(heading.textContent ?? "").includes(sectionTitle);
        }) ?? headings[index];

      if (matchingHeading) {
        matchingHeading.id = section.id;
        matchingHeading.setAttribute("tabindex", "-1");
        usedHeadings.add(matchingHeading);
      }
    });
  }, [articleMeta.sections]);

  return (
    <div className="blog-page-shell min-h-screen bg-white text-heading">
      <a href="#article-content" className="blog-skip-link">
        Skip to article
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center">
            <Logo size={34} />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-body">
            <Link to="/blog" className="hidden transition-colors hover:text-heading sm:inline">
              Blog
            </Link>
            <Link to="/features" className="hidden transition-colors hover:text-heading sm:inline">
              Features
            </Link>
            <Link to="/pricing" className="hidden transition-colors hover:text-heading sm:inline">
              Pricing
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full bg-heading px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-light"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main id="article-content" className="blog-reading-frame">
        <article className="blog-article-shell" aria-labelledby="article-title">
          <Link to="/blog" className="blog-back-link">
            <ArrowLeft size={14} /> All articles
          </Link>

          <header className="blog-article-header">
            <div className="blog-article-meta" aria-label="Article details">
              <span>
                <Calendar size={13} /> {articleMeta.publishDate}
              </span>
              <span>
                <Clock size={13} /> {articleMeta.readTime}
              </span>
              {articleMeta.wordCount ? <span>{articleMeta.wordCount.toLocaleString()} words</span> : null}
              {articleMeta.author ? (
                <span>
                  <UserRound size={13} /> {articleMeta.author}
                </span>
              ) : null}
            </div>

            <h1 id="article-title" className="blog-article-title">
              {articleMeta.title}
            </h1>
            <p className="blog-article-description">{articleMeta.description}</p>

            {articleMeta.outcomes.length ? (
              <section className="blog-learning-goals" aria-labelledby="learning-goals-title">
                <h2 id="learning-goals-title">
                  <ListChecks size={16} /> What you will learn
                </h2>
                <ul>
                  {articleMeta.outcomes.map((outcome) => (
                    <li key={outcome}>
                      <CheckCircle2 size={15} /> <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </header>

          <div ref={contentRef} className="prose-klassruum blog-prose">
            {children}
          </div>
        </article>

        <aside className="blog-reading-aside" aria-label="Article navigation">
          {articleMeta.audience ? (
            <section className="blog-aside-block">
              <h2>Best for</h2>
              <p>{articleMeta.audience}</p>
            </section>
          ) : null}

          {articleMeta.sections.length ? (
            <nav className="blog-aside-block blog-toc" aria-labelledby="article-contents-title">
              <h2 id="article-contents-title">Contents</h2>
              <ol>
                {articleMeta.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          {relatedPosts.length ? (
            <section className="blog-aside-block blog-related">
              <h2>Read next</h2>
              <div>
                {relatedPosts.map((post) => (
                  <Link key={post.slug} to={getBlogPostHref(post.slug)}>
                    <span>{post.category}</span>
                    {post.title}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </main>

      <Footer />
    </div>
  );
}
