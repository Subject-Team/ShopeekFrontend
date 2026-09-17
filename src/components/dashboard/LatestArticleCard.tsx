import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Clock } from 'lucide-react';
import { BLOG_POSTS } from '../../data/blog/posts';
import { toPersianDigits } from '../../utils/persian';

/**
 * Static dashboard widget showing the newest blog article.
 *
 * Pure/static: reads BLOG_POSTS directly (no API fetch) and picks the newest
 * post by `isoPublishedAt` descending — never relies on array order. Renders
 * nothing when the blog catalog is empty.
 */
export const LatestArticleCard: React.FC = () => {
  const latestPost = useMemo(() => {
    if (BLOG_POSTS.length === 0) return null;
    return BLOG_POSTS.reduce((newest, post) =>
      Date.parse(post.isoPublishedAt) > Date.parse(newest.isoPublishedAt) ? post : newest
    );
  }, []);

  if (!latestPost) return null;

  return (
    <article className="glass-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs flex flex-col group">
      {/* Header */}
      <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
        <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900/50 text-brand-600 dark:text-brand-400">
          <BookOpen className="w-4 h-4" />
        </div>
        <h4 className="font-extrabold text-sm">آخرین مقاله وبلاگ</h4>
      </div>

      {/* Featured image + category badge */}
      <Link
        to={`/blog/${latestPost.slug}`}
        className="relative block overflow-hidden rounded-xl aspect-video bg-slate-900"
      >
        <img
          src={latestPost.featuredImage}
          alt={latestPost.imageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute top-2.5 start-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
          {latestPost.category}
        </span>
      </Link>

      {/* Published date + reading time */}
      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {latestPost.publishedAt}
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {toPersianDigits(latestPost.readingTimeMinutes)} دقیقه مطالعه
        </span>
      </div>

      {/* Title */}
      <Link to={`/blog/${latestPost.slug}`} className="block">
        <h5 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
          {latestPost.title}
        </h5>
      </Link>

      {/* Excerpt */}
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
        {latestPost.excerpt}
      </p>

      {/* Author + continue reading */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {latestPost.author.name}
        </span>
        <Link
          to={`/blog/${latestPost.slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          <span>ادامه مطلب</span>
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
};