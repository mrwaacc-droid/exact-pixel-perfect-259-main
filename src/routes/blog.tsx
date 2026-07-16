import { Outlet, createFileRoute, Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Accessibility,
  ArrowRight,
  BookOpenText,
  Clock,
  FileText,
  GraduationCap,
  Landmark,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Footer } from "@/components/landing/Footer";
import { CTAButton } from "@/components/landing/primitives";
import {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  getBlogPostHref,
  type BlogCategory,
} from "@/lib/blog-content";
import "@/styles/landing.css";

const CATEGORY_ICONS: Record<BlogCategory, ReactNode> = {
  "Teaching methodology": <GraduationCap size={17} />,
  Accessibility: <Accessibility size={17} />,
  "Industry trends": <Landmark size={17} />,
  Compliance: <Shield size={17} />,
  "Thought leadership": <BookOpenText size={17} />,
};

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog - Klassruum" },
      {
        name: "description",
        content:
          "Organized guides on AI teaching, accessibility, GDPR compliance, and structured learning in education.",
      },
      {
        name: "keywords",
        content:
          "EdTech blog, AI teaching, virtual classrooms, WCAG accessibility, GDPR education, structured learning",
      },
    ],
  }),
  component: BlogRoute,
});

function BlogRoute() {
  const location = useLocation();

  if (location.pathname !== "/blog") {
    return <Outlet />;
  }

  return <BlogIndex />;
}

function BlogIndex() {
  const featuredPosts = BLOG_POSTS.filter((post) => post.featured);
  const totalWords = BLOG_POSTS.reduce((total, post) => total + post.wordCount, 0);

  return (
    <div className="blog-page-shell min-h-screen bg-white text-heading">
      <a href="#blog-directory" className="blog-skip-link">
        Skip to articles
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center">
            <Logo size={34} />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-body">
            <Link to="/features" className="hidden transition-colors hover:text-heading sm:inline">
              Features
            </Link>
            <Link to="/pricing" className="hidden transition-colors hover:text-heading sm:inline">
              Pricing
            </Link>
            <Link
              to="/demo/classroom"
              className="hidden transition-colors hover:text-heading sm:inline"
            >
              Demo
            </Link>
            <CTAButton to="/auth" size="md" className="h-10 px-4">
              Get started
            </CTAButton>
          </nav>
        </div>
      </header>

      <main id="blog-directory" className="blog-index-shell">
        <section className="blog-index-hero" aria-labelledby="blog-title">
          <div>
            <p className="blog-kicker">Klassruum knowledge base</p>
            <h1 id="blog-title">Teaching guides, not content drops.</h1>
            <p>
              Long-form articles organized into usable learning paths for education teams making
              decisions about AI classrooms, accessibility, privacy, and structured instruction.
            </p>
          </div>

          <dl className="blog-index-stats" aria-label="Blog library summary">
            <div>
              <dt>Articles</dt>
              <dd>{BLOG_POSTS.length}</dd>
            </div>
            <div>
              <dt>Topics</dt>
              <dd>{BLOG_CATEGORIES.length}</dd>
            </div>
            <div>
              <dt>Library</dt>
              <dd>{Math.round(totalWords / 1000)}k words</dd>
            </div>
          </dl>
        </section>

        <section className="blog-featured-strip" aria-labelledby="featured-title">
          <div className="blog-section-heading">
            <p>Start here</p>
            <h2 id="featured-title">Decision-ready teaching reads</h2>
          </div>

          <div className="blog-featured-list">
            {featuredPosts.map((post) => (
              <Link key={post.slug} to={getBlogPostHref(post.slug)} className="blog-featured-link">
                <span>{CATEGORY_ICONS[post.category]}</span>
                <div>
                  <p>{post.category}</p>
                  <h3>{post.title}</h3>
                  <small>
                    {post.readTime} / {post.wordCount.toLocaleString()} words / {post.audience}
                  </small>
                </div>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <nav className="blog-topic-nav" aria-label="Browse by topic">
          {BLOG_CATEGORIES.map((category) => (
            <a key={category} href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
              {CATEGORY_ICONS[category]}
              {category}
            </a>
          ))}
        </nav>

        <div className="blog-topic-directory">
          {BLOG_CATEGORIES.map((category) => {
            const posts = BLOG_POSTS.filter((post) => post.category === category);
            const categoryId = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");

            return (
              <section key={category} id={categoryId} className="blog-topic-section">
                <div className="blog-topic-label">
                  <span>{CATEGORY_ICONS[category]}</span>
                  <h2>{category}</h2>
                </div>

                <div className="blog-article-ledger">
                  {posts.map((post) => (
                    <article key={post.slug} className="blog-article-row">
                      <div>
                        <div className="blog-row-meta">
                          <span>
                            <Clock size={13} /> {post.readTime}
                          </span>
                          <span>
                            <FileText size={13} /> {post.wordCount.toLocaleString()} words
                          </span>
                        </div>
                        <h3>
                          <Link to={getBlogPostHref(post.slug)}>{post.title}</Link>
                        </h3>
                        <p>{post.description}</p>
                        <ul aria-label="Learning outcomes">
                          {post.outcomes.map((outcome) => (
                            <li key={outcome}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                      <Link to={getBlogPostHref(post.slug)} className="blog-row-action">
                        Read guide <ArrowRight size={14} />
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <section className="blog-cta-band">
        <div>
          <h2>See the teaching model in context</h2>
          <p>Open the demo classroom to compare guided instruction against passive content.</p>
        </div>
        <CTAButton to="/demo/classroom" size="lg" showArrow>
          Enter the demo classroom
        </CTAButton>
      </section>

      <Footer />
    </div>
  );
}
