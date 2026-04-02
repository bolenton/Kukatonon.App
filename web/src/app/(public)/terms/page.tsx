import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: April 2, 2026</p>

      <div className="prose-memorial text-gray-700 space-y-6">
        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Kukatonon (kukatonon.app and the Kukatonon mobile application),
            you agree to be bound by these Terms of Service. If you do not agree to these terms,
            please do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">2. Purpose of the Platform</h2>
          <p>
            Kukatonon is a non-commercial memorial platform operated by the Kuwoo Movement. Its
            sole purpose is to honor and preserve the memories of victims of the Liberian Civil
            War (1989-2003) through shared stories, images, and videos.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">3. Story Submissions</h2>
          <p>By submitting a story, you agree that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The information you provide is truthful and accurate to the best of your knowledge</li>
            <li>You have the right to share the story and any accompanying media</li>
            <li>You grant Kukatonon a non-exclusive, royalty-free license to display, publish, and distribute the submitted content on our platform</li>
            <li>You consent to editorial review and potential modification by our moderators to ensure clarity, dignity, and accuracy</li>
            <li>Submissions may be approved, edited, or declined at the discretion of our moderation team</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">4. Content Guidelines</h2>
          <p>All content submitted to Kukatonon must:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Be respectful and honor the memory of the individuals mentioned</li>
            <li>Not contain hate speech, incitement to violence, or discriminatory language</li>
            <li>Not include false or deliberately misleading information</li>
            <li>Not violate the privacy or rights of any living individual without their consent</li>
            <li>Not contain commercial advertising or spam</li>
          </ul>
          <p>
            We reserve the right to remove any content that violates these guidelines.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">5. Intellectual Property</h2>
          <p>
            The Kukatonon platform, including its design, code, and branding, is the property of
            the Kuwoo Movement. User-submitted stories and media remain the intellectual property
            of their respective submitters, subject to the license granted in Section 3.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">6. Disclaimer</h2>
          <p>
            Kukatonon is provided "as is" without warranties of any kind. While we strive for
            accuracy, we cannot verify every detail of every submitted story. The views and
            accounts shared on the platform are those of the individual submitters and do not
            necessarily represent the views of the Kuwoo Movement.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Kukatonon and the Kuwoo Movement shall not
            be liable for any indirect, incidental, or consequential damages arising from your
            use of the platform.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">8. Modifications</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be
            effective upon posting to the platform. Continued use of the platform after changes
            constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">9. Governing Law</h2>
          <p>
            These terms shall be governed by the laws of the Republic of Liberia.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-gray-900 mt-8 mb-3">10. Contact</h2>
          <p>
            For questions about these Terms of Service, please contact:
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
