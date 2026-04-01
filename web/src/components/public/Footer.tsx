import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-500 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-earth-gold font-serif text-xl font-bold mb-3">
              Kukatonon
            </h3>
            <p className="text-sm leading-relaxed">
              A National Act of Memory, Healing, and Collective Responsibility.
              Honoring the victims of the Liberian Civil War.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-3 text-sm uppercase tracking-wider">
              Navigate
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-earth-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-earth-gold transition-colors">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-earth-gold transition-colors">
                  Share a Story
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-earth-gold transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-3 text-sm uppercase tracking-wider">
              Presented by
            </h4>
            <p className="text-sm mb-2">Kuwoo Movement</p>
            <p className="text-sm">
              For info: <span className="text-earth-gold">+231 880 710 399</span>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Kukatonon. All rights reserved.</p>
          <p className="mt-1">In memory of those we lost. May their stories never be forgotten.</p>
        </div>
      </div>
    </footer>
  );
}
