import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ChevronRight,
  Share2,
  Check,
  Send,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Info,
  AlertTriangle,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader';
import { MainFooter } from '../components/layout/MainFooter';
import { BlogSEO } from '../components/common/BlogSEO';
import { getPostBySlug, getRelatedPosts } from '../data/blog/posts';
import { toPersianDigits } from '../utils/persian';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState<boolean>(false);

  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  const post = getPostBySlug(slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = getRelatedPosts(post.slug, 2);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://shopeekapp.ir/blog/${post.slug}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white">
      <BlogSEO
        title={post.metaTitle}
        description={post.metaDescription}
        canonicalPath={`/blog/${post.slug}`}
        type="article"
        image={post.featuredImage}
        post={post}
      />

      <PublicHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="راهنمای مسیر" className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto py-1">
          <Link to="/" className="hover:text-brand-600 transition-colors shrink-0">
            صفحه اصلی
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 rotate-180 text-slate-400" />
          <Link to="/blog" className="hover:text-brand-600 transition-colors shrink-0">
            وبلاگ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 rotate-180 text-slate-400" />
          <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">
            {post.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="space-y-4 border-b border-slate-200 pb-6 sm:pb-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
              {post.category}
            </span>
          </div>

          {/* Single H1 tag for On-Page SEO requirement */}
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight sm:leading-snug tracking-tight">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {post.excerpt}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                {post.author.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {post.publishedAt}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {toPersianDigits(post.readingTimeMinutes)} دقیقه مطالعه
              </span>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" />
                اشتراک:
              </span>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 text-slate-600 transition-colors"
                title="اشتراک‌گذاری در تلگرام"
                aria-label="اشتراک‌گذاری در تلگرام"
              >
                <Send className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1"
                title="کپی پیوند مقاله"
                aria-label="کپی پیوند مقاله"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                {copied && <span className="text-[11px] text-emerald-600 font-bold">کپی شد</span>}
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-video bg-slate-900">
          <img
            src={post.featuredImage}
            alt={post.imageAlt}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        {/* Table of Contents Box */}
        {post.sections.length > 0 && (
          <nav aria-label="فهرست مطالب مقاله" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              <span>فهرست عناوین مقاله</span>
            </h2>
            <ul className="space-y-2 text-xs text-slate-600">
              {post.sections.map((section, idx) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-slate-400 font-mono text-[11px]">{toPersianDigits(idx + 1)}.</span>
                    <span className="underline-offset-4 hover:underline">{section.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Article Body Content */}
        <article className="space-y-10 text-slate-800 text-sm sm:text-base leading-relaxed">
          {post.sections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-4 scroll-mt-24">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug tracking-tight border-r-4 border-brand-500 pr-3">
                {section.title}
              </h2>

              <div className="space-y-3.5 text-slate-700 leading-relaxed font-normal">
                {section.content.map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-xs sm:text-sm leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {section.callout && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                    section.callout.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : section.callout.type === 'info'
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {section.callout.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : section.callout.type === 'info' ? (
                      <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span>{section.callout.title || 'نکته کاربردی'}</span>
                  </div>
                  <p className="text-xs font-normal opacity-95">
                    {section.callout.text}
                  </p>
                </div>
              )}

              {section.subsections && section.subsections.length > 0 && (
                <div className="space-y-5 pt-2">
                  {section.subsections.map((sub, sIdx) => (
                    <div key={sIdx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {sub.title}
                      </h3>
                      {sub.content.map((subP, subPIdx) => (
                        <p key={subPIdx} className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {subP}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </article>

        {/* In-Article Contextual Shopeek CTA Card */}
        <section className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>راهکار عملی شاپیک برای کسب‌وکار شما</span>
          </div>

          <h2 className="text-base sm:text-xl font-black text-white leading-snug">
            تحلیل فروش، محاسبه سود واقعی و مدیریت مشتریان بدون نیاز به فرمول‌های پیچیده
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            با سامانه شاپیک می‌توانید در چند دقیقه فایل اکسل فروش را بارگذاری کنید، یا از طریق ربات تلگرام فاکتورهایتان را در لحظه ثبت نمایید و گزارش‌های سود ناخالص و پیش‌بینی هوشمند را مشاهده کنید.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-900 font-bold text-xs transition-all shadow-md shadow-brand-500/20"
            >
              شروع رایگان با دوره ۱۴ روزه
            </Link>
            <Link
              to="/#features"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
            >
              مشاهده قابلیت‌های سامانه
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        {post.faq && post.faq.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-600" />
              <span>پرسش‌های متداول</span>
            </h2>

            <div className="space-y-3">
              {post.faq.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {item.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tags / Keywords Pill Row */}
        <section className="pt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500">برچسب‌ها:</span>
          {post.keywords.map((kw, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
            >
              #{kw}
            </span>
          ))}
        </section>

        {/* Author Bio Card */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
            <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">{post.author.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{post.author.role}</p>
          </div>
        </section>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className="space-y-5 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                مقالات پیشنهادی و مرتبط
              </h2>
              <Link
                to="/blog"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>همه مقالات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rPost) => (
                <article
                  key={rPost.slug}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                      {rPost.category}
                    </span>
                    <Link to={`/blog/${rPost.slug}`} className="block">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                        {rPost.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {rPost.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{rPost.publishedAt}</span>
                    <Link
                      to={`/blog/${rPost.slug}`}
                      className="text-brand-600 font-bold inline-flex items-center gap-1 hover:text-brand-700"
                    >
                      <span>مطالعه</span>
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <MainFooter />
    </div>
  );
};
