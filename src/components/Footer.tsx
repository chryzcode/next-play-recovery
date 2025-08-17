import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Next Play Recovery</h3>
            <p className="text-gray-300 text-sm mb-4">
              Empowering families with comprehensive youth sports injury tracking and recovery resources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-300 hover:text-white transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <a href="mailto:hello@nextplayrecovery.com" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-md font-semibold mb-4">Support</h4>
            <p className="text-gray-300 text-sm mb-2">
              Questions? Reach out to our support team.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="text-center">
            <div className="text-sm text-gray-300 flex flex-col md:flex-row items-center justify-center gap-2">
              © 2025–Present Next Play Recovery | Informational use only — not medical advice.{' '}
              <Link 
                href="/legal" 
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Terms & Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
