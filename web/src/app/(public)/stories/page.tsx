import StoryCard from "@/components/public/StoryCard";
import type { PublicStory } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Read memorial stories honoring the victims of the Liberian Civil War.",
};

async function getStories(): Promise<{ stories: PublicStory[]; total: number }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/stories?limit=50`, {
      cache: "no-store",
    });
    if (!res.ok) return { stories: [], total: 0 };
    const data = await res.json();
    return { stories: data.stories || [], total: data.pagination?.total || 0 };
  } catch {
    return { stories: [], total: 0 };
  }
}

export default async function StoriesPage() {
  const { stories, total } = await getStories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <p className="text-earth-gold text-sm tracking-[0.2em] uppercase mb-2">
          Memorial Stories
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-earth-dark mb-4">
          Lives Remembered
        </h1>
        <p className="text-earth-warm/80 max-w-2xl mx-auto">
          {total > 0
            ? `${total} ${total === 1 ? "story" : "stories"} shared in memory of those we lost.`
            : "Stories will appear here once they are shared and approved."}
        </p>
      </div>

      {/* Stories Grid */}
      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-earth-gold/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-earth-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 className="font-serif text-xl text-earth-warm mb-2">
            No Stories Yet
          </h3>
          <p className="text-earth-warm/70">
            Be the first to share a memorial story.
          </p>
        </div>
      )}
    </div>
  );
}
