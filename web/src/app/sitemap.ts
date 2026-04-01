import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kukatonon.app";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/stories`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/submit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // Dynamic story pages
  try {
    const res = await fetch(`${baseUrl}/api/stories?limit=100`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const storyPages: MetadataRoute.Sitemap = (data.stories || []).map(
        (story: { slug: string; updated_at: string }) => ({
          url: `${baseUrl}/stories/${story.slug}`,
          lastModified: new Date(story.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })
      );
      return [...staticPages, ...storyPages];
    }
  } catch {
    // Fallback to static pages only
  }

  return staticPages;
}
