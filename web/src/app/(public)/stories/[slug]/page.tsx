import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StoryBlockRenderer from "@/components/public/StoryBlockRenderer";
import Link from "next/link";
import type { PublicStory } from "@/types/database";

async function getStoryBySlug(slug: string): Promise<PublicStory | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    // Fetch all approved stories and find by slug
    const res = await fetch(`${baseUrl}/api/stories?limit=100`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const story = (data.stories as PublicStory[])?.find(
      (s) => s.slug === slug
    );
    if (!story) {
      // Try fetching by ID if slug matches UUID pattern
      const idRes = await fetch(`${baseUrl}/api/stories/${slug}`, {
        cache: "no-store",
      });
      if (idRes.ok) return idRes.json();
      return null;
    }
    return story;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return { title: "Story Not Found" };

  return {
    title: `${story.honoree_name} - ${story.title}`,
    description:
      story.summary ||
      `Memorial for ${story.honoree_name}. ${story.title}.`,
    openGraph: {
      title: `In Memory of ${story.honoree_name}`,
      description:
        story.summary || `Memorial story: ${story.title}`,
      images: story.cover_image_url
        ? [{ url: story.cover_image_url, width: 1200, height: 630 }]
        : [],
      type: "article",
    },
  };
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-white">
      {/* Cover image */}
      {story.cover_image_url && (
        <div className="relative h-[40vh] sm:h-[50vh] lg:h-[60vh] bg-gray-100">
          <img
            src={story.cover_image_url}
            alt={`Memorial for ${story.honoree_name}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
        <p className="text-earth-gold text-sm tracking-[0.2em] uppercase font-medium mb-3">
          In Memory of
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">
          {story.honoree_name}
        </h1>
        <h2 className="text-gray-500 text-lg sm:text-xl">
          {story.title}
        </h2>
        <div className="flex items-center gap-3 mt-4 text-sm text-gray-400">
          <time dateTime={story.created_at}>
            {new Date(story.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          {story.submitted_by_name && (
            <>
              <span>&middot;</span>
              <span>Shared by {story.submitted_by_name}</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Summary */}
        {story.summary && (
          <div className="border-l-4 border-earth-gold pl-6 mb-10">
            <p className="text-lg text-gray-600 leading-relaxed italic font-serif">
              {story.summary}
            </p>
          </div>
        )}

        {/* Block-based content */}
        {story.show_event_location && story.event_latitude != null && story.event_longitude != null && (
          <div className="bg-earth-gold/5 border border-earth-gold/20 rounded-xl p-4 mb-10">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-earth-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-earth-gold">Where It Happened</span>
            </div>
            {story.event_location_name && (
              <p className="text-sm font-medium text-gray-900">{story.event_location_name}</p>
            )}
          </div>
        )}

        {story.content_blocks && story.content_blocks.length > 0 && (
          <div className="space-y-8 mb-10">
            {story.content_blocks.map((block) => (
              <StoryBlockRenderer key={block.id} block={block} />
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-earth-gold hover:text-earth-amber transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all stories
          </Link>
        </div>
      </div>
    </article>
  );
}
