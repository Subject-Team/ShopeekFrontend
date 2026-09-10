import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Calendar, ArrowLeft, BookOpen, Sparkles, Filter, X } from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader';
import { MainFooter } from '../components/layout/MainFooter';
import { BlogSEO } from '../components/common/BlogSEO';
import { BLOG_POSTS, BLOG_CATEGORIES } from '../data/blog/posts';
import { toPersianDigits } from '../utils/persian';

export const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === 'all' || post.categorySlug === selectedCategory;

      const matchesSearch =
        searchQuery.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = BLOG_POSTS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white">
      <BlogSEO
        title="وبلاگ و مقالات تحلیلی فروش و کسب‌وکار"
        description="مجموعه مقالات آموزشی و تخصصی شاپیک درباره تحلیل فروش، مدیریت سود و زیان، وفادارسازی مشتریان و ابزارهای هوشمند کسب‌وکارهای خرد."
        canonicalPath="/blog"
      />

      <PublicHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 sm:space-y-14">
        {/* Header Hero */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-4 sm:pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold shadow-2xs">
            <BookOpen className="w-4 h-4 text-brand-600" />
            <span>مرکز دانش و راهکارهای فروش شاپیک</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            مقالات و راهنمای تحلیل فروش کسب‌وکار
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            راهکارهای تجربی و عملی برای رشد درآمد، کنترل هزینه‌های پنهان، افزایش وفاداری مشتریان و تصمیم‌گیری داده‌محور در بازار ایران.
          </p>
        </section>

        {/* Search & Category Filter Controls */}
        <section className="space-y-4 max-w-4xl mx-auto">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در عناوین، مباحث یا کلمات کلیدی مقالات..."
              className="w-full pr-12 pl-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="پاک کردن جستجو"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 ml-2">
              <Filter className="w-3.5 h-3.5" />
              <span>دسته‌بندی:</span>
            </div>

            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white shadow-xs shadow-brand-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100/70'
              }`}
            >
              همه مقالات
            </button>

            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat.slug
                    ? 'bg-brand-600 text-white shadow-xs shadow-brand-600/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100/70'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Post Banner (Visible when no specific search is active) */}
        {!searchQuery && selectedCategory === 'all' && featuredPost && (
          <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    <span>مقاله ویژه و منتخب</span>
                  </span>
                  <span className="text-slate-400">{featuredPost.category}</span>
                </div>

                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="block group"
                >
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-brand-300 transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {featuredPost.excerpt}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {featuredPost.publishedAt}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {toPersianDigits(featuredPost.readingTimeMinutes)} دقیقه مطالعه
                    </span>
                  </div>

                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-900 font-bold text-xs transition-all shadow-md shadow-brand-500/20"
                  >
                    <span>مطالعه مقاله</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5">
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="block rounded-2xl overflow-hidden border border-slate-700/60 shadow-lg hover:scale-[1.01] transition-transform"
                >
                  <img
                    src={featuredPost.featuredImage}
                    alt={featuredPost.imageAlt}
                    className="w-full h-56 sm:h-64 object-cover"
                    loading="eager"
                  />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              {searchQuery ? `نتایج جستجو (${toPersianDigits(filteredPosts.length)} مقاله)` : 'آخرین مقالات و یادداشت‌ها'}
            </h2>
            <span className="text-xs text-slate-500">
              نمایش {toPersianDigits(filteredPosts.length)} از {toPersianDigits(BLOG_POSTS.length)} مطلب
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <p className="text-sm font-bold text-slate-700">مقاله‌ای مطابق با جستجوی شما یافت نشد.</p>
              <p className="text-xs text-slate-500">
                عبارت جستجو را تغییر دهید یا فیلتر دسته‌بندی را روی «همه مقالات» تنظیم فرمایید.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                مشاهده همه مقالات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-lg transition-all flex flex-col overflow-hidden group"
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="relative block overflow-hidden aspect-video bg-slate-900"
                  >
                    <img
                      src={post.featuredImage}
                      alt={post.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                      {post.category}
                    </span>
                  </Link>

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.publishedAt}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {toPersianDigits(post.readingTimeMinutes)} دقیقه
                        </span>
                      </div>

                      <Link to={`/blog/${post.slug}`} className="block">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">{post.author.name}</span>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        <span>ادامه مطلب</span>
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Bottom CTA Banner */}
        <section className="bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              می‌خواهید داده‌های فروش کسب‌وکارتان را هوشمندانه تحلیل کنید؟
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-normal">
              با سامانه تحلیلی شاپیک، نمودارهای فروش روزانه، محاسبه حاشیه سود واقعی، بخش‌بندی مشتریان و مشاوره هوش مصنوعی را به مدت ۱۴ روز رایگان تجربه کنید.
            </p>
          </div>
          <Link
            to="/login"
            className="shrink-0 px-6 py-3 rounded-xl bg-white text-brand-700 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
          >
            شروع دوره آزمایشی رایگان
          </Link>
        </section>
      </main>

      <MainFooter />
    </div>
  );
};
