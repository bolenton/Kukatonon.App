import Link from "next/link";
import StoryCard from "@/components/public/StoryCard";
import type { PublicStory } from "@/types/database";

async function getFeaturedStories(): Promise<PublicStory[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/stories?featured=true&limit=4`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.stories || [];
  } catch {
    return [];
  }
}

async function getLatestStories(): Promise<PublicStory[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/stories?limit=6`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.stories || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredStories, latestStories] = await Promise.all([
    getFeaturedStories(),
    getLatestStories(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-earth-darkest text-earth-cream overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 text-center">
          <p className="text-earth-amber text-sm tracking-[0.3em] uppercase mb-6">
            A National Act of Memory, Healing, and Collective Responsibility
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Kukatonon
          </h1>
          <p className="text-lg sm:text-xl text-earth-cream/80 max-w-2xl mx-auto mb-4">
            Liberian Civil War Victims Memorial
          </p>
          <p className="text-earth-cream/60 max-w-xl mx-auto mb-10 leading-relaxed">
            Every life lost deserves to be remembered. Every story deserves to be told.
            Share the memories of those we lost, so future generations never forget.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/stories"
              className="inline-block bg-earth-gold hover:bg-earth-amber text-earth-darkest px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
            >
              Read Their Stories
            </Link>
            <Link
              href="/submit"
              className="inline-block border-2 border-earth-gold text-earth-gold hover:bg-earth-gold hover:text-earth-darkest px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
            >
              Share a Story
            </Link>
          </div>
        </div>

        {/* Decorative bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-earth-light to-transparent" />
      </section>

      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <p className="text-earth-gold text-sm tracking-[0.2em] uppercase mb-2">
              Featured Memorials
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-earth-dark">
              Stories That Must Be Told
            </h2>
          </div>

          <div className="space-y-8">
            {featuredStories.map((story) => (
              <StoryCard key={story.id} story={story} featured />
            ))}
          </div>
        </section>
      )}

      {/* Latest Stories */}
      <section className="bg-white/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-earth-gold text-sm tracking-[0.2em] uppercase mb-2">
              Recent Memorials
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-earth-dark">
              Latest Stories
            </h2>
          </div>

          {latestStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestStories
                .filter((s) => !featuredStories.find((f) => f.id === s.id))
                .map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-earth-gold/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-earth-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="font-serif text-xl text-earth-warm mb-2">
                Stories Coming Soon
              </h3>
              <p className="text-earth-warm/70 mb-6">
                Be the first to share a memorial story.
              </p>
              <Link
                href="/submit"
                className="inline-block bg-earth-gold hover:bg-earth-amber text-earth-darkest px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Share a Story
              </Link>
            </div>
          )}

          {latestStories.length > 0 && (
            <div className="text-center mt-10">
              <Link
                href="/stories"
                className="inline-block border-2 border-earth-gold text-earth-gold hover:bg-earth-gold hover:text-earth-darkest px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View All Stories
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-earth-darkest text-earth-cream py-20 relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
            Help Us Remember
          </h2>
          <p className="text-earth-cream/70 text-lg mb-8 leading-relaxed">
            Every story shared is a life honored. If you know someone whose memory
            deserves to be preserved, we invite you to submit their story.
          </p>
          <Link
            href="/submit"
            className="inline-block bg-earth-gold hover:bg-earth-amber text-earth-darkest px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
          >
            Submit a Memorial Story
          </Link>
        </div>
      </section>
    </>
  );
}
