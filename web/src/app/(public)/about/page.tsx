import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about the Kukatonon memorial project — a National Act of Memory, Healing, and Collective Responsibility.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-earth-gold text-sm tracking-[0.2em] uppercase mb-3">
          About the Project
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-earth-dark mb-6">
          Kukatonon
        </h1>
        <p className="text-xl text-earth-warm font-serif italic">
          A National Act of Memory, Healing, and Collective Responsibility
        </p>
      </div>

      {/* Content */}
      <div className="prose-memorial text-earth-dark space-y-6 text-lg leading-relaxed">
        <p>
          The Liberian Civil War (1989–2003) claimed the lives of an estimated
          250,000 people and displaced over a million more. Entire communities
          were torn apart, families separated, and countless lives cut short.
        </p>

        <p>
          <strong>Kukatonon</strong> is a memorial platform dedicated to preserving
          the memories of those we lost. Through stories shared by survivors, family
          members, and community members, we seek to ensure that no life is forgotten
          and no sacrifice goes unrecognized.
        </p>

        <blockquote>
          &ldquo;Until the story of the hunt is told by the lion, the tale of the
          hunt will always glorify the hunter.&rdquo;
        </blockquote>

        <h2>Our Mission</h2>
        <p>
          We believe that remembering is the first step toward healing. Kukatonon
          provides a dignified space where:
        </p>
        <ul>
          <li>Victims are honored through stories shared by those who knew them</li>
          <li>Communities can collectively grieve and remember</li>
          <li>Future generations can learn about the true cost of conflict</li>
          <li>The nation can move forward through acknowledgment and truth</li>
        </ul>

        <h2>The Inaugural Walk to Remember</h2>
        <p>
          On <strong>April 4, 2026</strong>, we are holding the Inaugural Kukatonon
          Walk to Remember — a memorial walk from the Du Port Road Massacre Memorial
          to the Paynesville City Hall Grounds (Liberian Learning Center).
        </p>
        <p>
          The walk begins at <strong>7:00 AM</strong>, followed by a
          Remembrance Ceremony at <strong>10:00 AM</strong>. This is a national
          act of memory, healing, and collective responsibility.
        </p>

        <h2>How You Can Participate</h2>
        <ul>
          <li>
            <strong>Share a story:</strong> Submit a memorial story about someone
            you lost during the conflict
          </li>
          <li>
            <strong>Join the walk:</strong> Participate in the Walk to Remember on
            April 4, 2026
          </li>
          <li>
            <strong>Spread the word:</strong> Share this platform with others who
            have stories to tell
          </li>
        </ul>

        <h2>Presented By</h2>
        <p>
          Kukatonon is presented by the <strong>Kuwoo Movement</strong>, a Liberian
          organization dedicated to national healing, truth-telling, and collective
          responsibility.
        </p>
        <p>
          For more information, contact us at <strong>+231 880 710 399</strong>.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <div className="bg-earth-darkest rounded-2xl p-10 pattern-bg">
          <h3 className="font-serif text-2xl font-bold text-earth-cream mb-4">
            Every Story Matters
          </h3>
          <p className="text-earth-cream/70 mb-6 max-w-md mx-auto">
            Help us build a living memorial by sharing the story of someone
            you want the world to remember.
          </p>
          <Link
            href="/submit"
            className="inline-block bg-earth-gold hover:bg-earth-amber text-earth-darkest px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Submit a Story
          </Link>
        </div>
      </div>
    </div>
  );
}
