import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Next Play Recovery — Terms of Use, Privacy Policy & Disclaimer
          </h1>
          <div className="text-lg text-gray-600 space-y-2">
            <p><strong>Last updated:</strong> August 2025</p>
            <p><strong>Contact:</strong> hello@nextplayrecovery.com</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-12">
          {/* Terms of Use */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Terms of Use</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Purpose</h3>
                <p>
                  Next Play Recovery is a free web app that helps athletes, parents, and coaches log injuries or symptoms, track recovery progress, and access general resources.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Eligibility</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must be 13 years or older to create an account.</li>
                  <li>If you are 13–17 years old, you may use Next Play Recovery only with the knowledge and consent of a parent or guardian.</li>
                  <li>Children under 13 are not permitted to use the app. If we learn that a user under 13 has created an account, we will delete it promptly.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">User Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You are responsible for the accuracy of the information you enter.</li>
                  <li>You agree not to upload content you do not have rights to or attempt to access other users' information.</li>
                  <li>Parents/guardians are responsible for monitoring the use of the app by minors.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Changes</h3>
                <p>
                  We may update features, terms, or policies at any time. Continued use of the app means you accept the updated terms.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Termination</h3>
                <p>
                  We may suspend or terminate accounts that violate these terms or put user safety at risk.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Privacy Policy</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Information We Collect</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Data you provide: injury details, recovery notes, sport/activity, date ranges, and optional photos.</li>
                  <li>Technical data: device/browser information and basic analytics to improve performance.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">How We Use Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide the app's core functions (injury logging, recovery tracking, and access to resources).</li>
                  <li>To maintain and improve features and ensure safety.</li>
                  <li>Administrators may review user data when needed for support and maintenance.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Research Use</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We may use anonymized, aggregated data (without names, emails, or identifying details) for research purposes, such as identifying common injury trends or typical recovery timelines.</li>
                  <li>Any research outputs will not identify individual users.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Photos and Uploaded Content</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Stored privately and used only for your own tracking and app functionality.</li>
                  <li>Administrators may view uploads for support and maintenance but will not disclose or publish them without explicit permission.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Minors</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Users aged 13–17 must have parent/guardian consent to use the app.</li>
                  <li>Parents/guardians are encouraged to review entries and monitor usage.</li>
                  <li>Users under 13 are not allowed to create accounts.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Data Protection</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We take reasonable measures to protect your information.</li>
                  <li>We do not sell or rent user data.</li>
                  <li>If you would like your data deleted, please email us at hello@nextplayrecovery.com with the subject line "Data Deletion Request."</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Medical Disclaimer */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">3. Medical Disclaimer</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Next Play Recovery does not provide medical advice, diagnosis, or treatment. The app, including its Resource Center, is for informational and educational purposes only.
              </p>
              <p>
                Any articles, tips, or resources provided within the app are not intended to replace professional medical advice, diagnosis, or treatment. Always seek the advice of a licensed healthcare provider regarding any questions about injuries, symptoms, or medical conditions. Users and parents/guardians are responsible for making appropriate health decisions.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Limitation of Liability</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                To the fullest extent permitted by law, Next Play Recovery and its creators are not liable for any injury, loss, or damages arising from the use of this app or reliance on its content. Your use of the app is at your own risk.
              </p>
            </div>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Acceptance of Terms</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                By creating an account or using the app, you acknowledge that you have read, understood, and agree to these Terms of Use, Privacy Policy, and Disclaimer.
              </p>
            </div>
          </section>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
