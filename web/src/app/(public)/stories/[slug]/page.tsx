import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RichTextRenderer from "@/components/public/RichTextRenderer";
import YouTubeEmbed from "@/components/public/YouTubeEmbed";
import MediaGallery from "@/components/public/MediaGallery";
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
    <article className="min-h-screen">
      {/* Hero / Cover */}
      <div className="relative bg-earth-darkest">
        {story.cover_image_url ? (
          <div className="relative h-[40vh] sm:h-[50vh] lg:h-[60vh]">
            <img
              src={story.cover_image_url}
              alt={`Memorial for ${story.honoree_name}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-earth-darkest via-earth-darkest/50 to-transparent" />
          </div>
        ) : (
          <div className="h-[30vh] sm:h-[35vh] pattern-bg bg-earth-brown" />
        )}

        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
            <p className="text-earth-amber text-sm tracking-[0.2em] uppercase mb-3">
              In Memory of
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-earth-cream mb-3 leading-tight">
              {story.honoree_name}
            </h1>
            <h2 className="text-earth-cream/80 text-lg sm:text-xl">
              {story.title}
            </h2>
            <div className="flex items-center gap-3 mt-4 text-sm text-earth-cream/60">
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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Summary */}
        {story.summary && (
          <div className="border-l-4 border-earth-gold pl-6 mb-10">
            <p className="text-lg text-earth-warm leading-relaxed italic font-serif">
              {story.summary}
            </p>
          </div>
        )}

        {/* Rich text content */}
        {story.content_html && (
          <div className="mb-10">
            <RichTextRenderer html={story.content_html} className="text-earth-dark" />
          </div>
        )}

        {/* YouTube embeds */}
        {story.youtube_urls && story.youtube_urls.length > 0 && (
          <div className="space-y-6 mb-10">
            {story.youtube_urls.map((url, index) => (
              <YouTubeEmbed key={index} url={url} />
            ))}
          </div>
        )}

        {/* Media gallery */}
        {story.media_items && story.media_items.length > 0 && (
          <div className="mb-10">
            <MediaGallery items={story.media_items} />
          </div>
        )}

        {/* Back link */}
        <div className="border-t border-earth-cream pt-8 mt-12">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-earth-gold hover:text-earth-amber transition-colors"
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
