import Link from "next/link";
import type { PublicStory } from "@/types/database";

interface StoryCardProps {
  story: PublicStory;
  featured?: boolean;
}

export default function StoryCard({ story, featured = false }: StoryCardProps) {
  const href = `/stories/${story.slug}`;

  return (
    <Link href={href} className="group block">
      <article
        className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-earth-cream ${
          featured ? "md:flex" : ""
        }`}
      >
        {/* Cover image */}
        <div
          className={`relative overflow-hidden bg-earth-brown/10 ${
            featured ? "md:w-1/2 aspect-[16/9] md:aspect-auto" : "aspect-[4/3]"
          }`}
        >
          {story.cover_image_url ? (
            <img
              src={story.cover_image_url}
              alt={`Memorial for ${story.honoree_name}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-earth-brown to-earth-darkest flex items-center justify-center pattern-bg">
              <div className="text-center px-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-earth-gold/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-earth-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <span className="text-earth-cream/60 text-sm font-serif">
                  {story.honoree_name}
                </span>
              </div>
            </div>
          )}

          {/* Featured badge */}
          {story.is_featured && (
            <div className="absolute top-3 left-3 bg-earth-gold text-earth-darkest text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`p-5 ${featured ? "md:w-1/2 md:p-8 md:flex md:flex-col md:justify-center" : ""}`}>
          <p className="text-earth-gold text-xs font-semibold uppercase tracking-wider mb-2">
            In Memory of
          </p>
          <h3
            className={`font-serif font-bold text-earth-dark group-hover:text-earth-gold transition-colors ${
              featured ? "text-xl md:text-2xl" : "text-lg"
            }`}
          >
            {story.honoree_name}
          </h3>
          <h4 className="text-earth-warm text-sm mt-1 font-medium">{story.title}</h4>
          {story.summary && (
            <p className="text-earth-warm/80 text-sm mt-3 line-clamp-3 leading-relaxed">
              {story.summary}
            </p>
          )}
          <div className="flex items-center gap-2 mt-4 text-xs text-earth-warm/60">
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
                <span>by {story.submitted_by_name}</span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
