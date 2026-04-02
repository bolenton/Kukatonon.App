"use client";

import { useEffect, useState, useCallback } from "react";
import StoryCard from "@/components/public/StoryCard";
import type { PublicStory } from "@/types/database";

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function StoriesPage() {
  const [stories, setStories] = useState<PublicStory[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/categories").then(r => r.ok ? r.json() : { categories: [] }).then(d => setCategories(d.categories || []));
  }, []);

  const loadStories = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "12");
    params.set("page", String(page));
    if (search) params.set("search", search);
    if (activeCategory) params.set("category", activeCategory);

    try {
      const res = await fetch(`/api/stories?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setStories(data.stories || []);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, page]);

  useEffect(() => { loadStories(); }, [loadStories]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleCategoryClick(catId: string) {
    setActiveCategory(activeCategory === catId ? "" : catId);
    setPage(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center mb-10">
        <p className="text-earth-gold text-sm tracking-[0.2em] uppercase font-medium mb-2">
          Memorial Stories
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Lives Remembered
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          {pagination.total > 0
            ? `${pagination.total} ${pagination.total === 1 ? "story" : "stories"} shared in memory of those we lost.`
            : "Stories will appear here once they are shared and approved."}
        </p>
      </div>

      {/* Search and Categories */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search by name, title, or summary..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-earth-gold focus:border-earth-gold outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-earth-amber text-earth-darkest rounded-lg text-sm font-medium hover:bg-earth-orange transition-colors"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
              className="px-3 py-2.5 text-gray-500 hover:text-gray-700 text-sm"
            >
              Clear
            </button>
          )}
        </form>

        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-earth-gold/15 text-earth-gold border border-earth-gold/30"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-earth-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stories.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 px-3">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-earth-gold/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-earth-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 className="font-serif text-xl text-gray-600 mb-2">
            {search || activeCategory ? "No Stories Found" : "No Stories Yet"}
          </h3>
          <p className="text-gray-400">
            {search || activeCategory ? "Try a different search or category." : "Be the first to share a memorial story."}
          </p>
        </div>
      )}
    </div>
  );
}
