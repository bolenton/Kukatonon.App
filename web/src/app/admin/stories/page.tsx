"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import type { Story, StoryStatus } from "@/types/database";

type EnrichedStory = Story & { approver_name: string | null };

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminStoriesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-earth-gold border-t-transparent rounded-full animate-spin" /></div>}>
      <AdminStoriesContent />
    </Suspense>
  );
}

function AdminStoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stories, setStories] = useState<EnrichedStory[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StoryStatus | "all">(
    (searchParams.get("status") as StoryStatus) || "all"
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [successMsg, setSuccessMsg] = useState(searchParams.get("created") === "true" ? "Story created successfully." : "");

  const loadStories = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (filter !== "all") params.set("status", filter);
    if (search) params.set("search", search);
    if (searchParams.get("featured")) params.set("featured", "true");

    try {
      const res = await fetch(`/api/admin/stories?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setStories(data.stories || []);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [filter, search, page, searchParams]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    if (search) params.set("search", search);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(`/admin/stories${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [filter, search, page, router]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleFilterChange(newFilter: StoryStatus | "all") {
    setFilter(newFilter);
    setPage(1);
  }

  async function toggleFeatured(id: string, current: boolean) {
    const res = await fetch(`/api/admin/stories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_featured: !current }),
    });
    if (res.ok) {
      setStories((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_featured: !current } : s))
      );
    }
  }

  async function updateStatus(id: string, action: "approve" | "reject") {
    const res = await fetch(`/api/admin/stories/${id}/${action}`, { method: "POST" });
    if (res.ok) {
      const newStatus = action === "approve" ? "approved" : "rejected";
      setStories((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus as "approved" | "rejected" } : s))
      );
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">All Stories</h1>
          <p className="text-gray-500 mt-1">
            {pagination.total} {pagination.total === 1 ? "story" : "stories"}
          </p>
        </div>
        <Link
          href="/admin/stories/new"
          className="px-4 py-2 bg-earth-amber text-earth-darkest rounded-lg text-sm font-medium hover:bg-earth-orange transition-colors"
        >
          + Create Story
        </Link>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-green-500 hover:text-green-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search by title, honoree, or submitter..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-earth-gold focus:border-earth-gold"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
              className="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-sm"
            >
              Clear
            </button>
          )}
        </form>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-earth-gold text-earth-darkest"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-earth-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stories.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-400">No stories found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Honoree</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Creator</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Approver</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Featured</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stories.map((story) => (
                    <tr key={story.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{story.honoree_name}</p>
                        <p className="text-xs text-gray-500 md:hidden">{story.title}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell max-w-xs truncate">
                        {story.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[story.status]}`}>
                          {story.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                        {story.submitted_by_name || <span className="text-gray-400 italic">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                        {story.approver_name || <span className="text-gray-400 italic">-</span>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <button
                          onClick={() => toggleFeatured(story.id, story.is_featured)}
                          className={`w-8 h-5 rounded-full transition-colors ${
                            story.is_featured ? "bg-earth-gold" : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              story.is_featured ? "translate-x-3.5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell whitespace-nowrap">
                        {new Date(story.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <ActionMenu
                          story={story}
                          onApprove={() => updateStatus(story.id, "approve")}
                          onReject={() => updateStatus(story.id, "reject")}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1}
                {" - "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}
                {" of "}
                {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === "ellipsis" ? (
                      <span key={`e${i}`} className="px-2 py-1.5 text-gray-400 text-sm">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          page === item
                            ? "bg-earth-gold text-earth-darkest"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ActionMenu({
  story,
  onApprove,
  onReject,
}: {
  story: EnrichedStory;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
          <Link
            href={`/admin/stories/${story.id}`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit
          </Link>
          {story.status !== "approved" && (
            <button
              onClick={() => { onApprove(); setOpen(false); }}
              className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
            >
              Approve
            </button>
          )}
          {story.status !== "rejected" && (
            <button
              onClick={() => { onReject(); setOpen(false); }}
              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
}
