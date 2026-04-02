import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: April 2, 2026</p>

      <div className="prose-memorial text-gray-700 space-y-6">
        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">1. Introduction</h2>
          <p>
            Kukatonon ("we," "our," or "us") is a memorial platform operated by the Kuwoo Movement,
            dedicated to preserving the memories of victims of the Liberian Civil War. This Privacy
            Policy explains how we collect, use, and protect your information when you use our
            website (kukatonon.app) and mobile application.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">2. Information We Collect</h2>
          <p><strong>Story Submissions:</strong> When you submit a memorial story, we collect the honoree's name, the story content, any uploaded images or videos, and your contact information (name, phone number, WhatsApp number, and/or email address).</p>
          <p><strong>Admin Accounts:</strong> For admin users, we store email addresses, names, and authentication credentials.</p>
          <p><strong>Usage Data:</strong> We may collect basic usage information such as pages visited and device type to improve our service.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Publish and display approved memorial stories on our platform</li>
            <li>Contact story submitters regarding their submissions</li>
            <li>Moderate content to ensure dignity and accuracy</li>
            <li>Operate and maintain the platform</li>
            <li>Respond to inquiries and provide support</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">4. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. Submitter
            contact information is only visible to platform administrators for moderation purposes
            and is never displayed publicly.
          </p>
          <p>
            Published stories display the honoree's name, story content, media, and the submitter's
            name (if provided). No phone numbers, email addresses, or WhatsApp numbers are shown publicly.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">5. Data Storage and Security</h2>
          <p>
            Your data is stored securely using Supabase, a trusted cloud database provider.
            Uploaded media is stored in secure cloud storage. We implement appropriate technical
            measures to protect your information, including encrypted connections (HTTPS) and
            access controls for administrative functions.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Request access to the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request removal of a story you submitted</li>
            <li>Withdraw consent for the use of your contact information</li>
          </ul>
          <p>To exercise these rights, contact us at the information provided below.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">7. Children's Privacy</h2>
          <p>
            Our platform is not directed at children under 13. We do not knowingly collect
            personal information from children. If you believe a child has submitted information
            to us, please contact us so we can remove it.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your rights,
            please contact:
          </p>
          <p>
            <strong>Kuwoo Movement</strong><br />
            Phone: +231 880 710 399<br />
            Website: kukatonon.app
          </p>
        </section>
      </div>
    </div>
  );
}
