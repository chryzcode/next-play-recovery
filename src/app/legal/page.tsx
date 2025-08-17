import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Legal Information</h1>
          <p className="text-lg text-gray-600">Terms of Use, Privacy Policy, and Disclaimer</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-12">
          {/* Terms of Use */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Terms of Use</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Welcome to Next Play Recovery. By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p>
                <strong>Acceptance of Terms:</strong> By using Next Play Recovery, you agree to these Terms of Use. If you do not agree to these terms, please do not use the application.
              </p>
              <p>
                <strong>Use License:</strong> Permission is granted to temporarily download one copy of the application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
              <p>
                <strong>Restrictions:</strong> You may not modify or copy the materials, use the materials for any commercial purpose, attempt to reverse engineer any software contained in the application, or remove any copyright or other proprietary notations from the materials.
              </p>
              <p>
                <strong>User Responsibilities:</strong> You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </div>
          </section>

          {/* Privacy Policy */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Next Play Recovery is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.
              </p>
              <p>
                <strong>Information We Collect:</strong> We collect information you provide directly to us, such as when you create an account, log injuries, or upload photos. This may include your name, email address, and injury-related information.
              </p>
              <p>
                <strong>How We Use Your Information:</strong> We use the information we collect to provide, maintain, and improve our services, communicate with you, and ensure the security of our application.
              </p>
              <p>
                <strong>Data Storage:</strong> Your data is stored securely using industry-standard encryption and security measures. Photos are stored using Cloudinary's secure cloud storage service.
              </p>
              <p>
                <strong>Data Sharing:</strong> We do not sell, trade, or otherwise transfer your personal information to third parties, except as described in this policy or with your explicit consent.
              </p>
              <p>
                <strong>Research and Analytics:</strong> We may use anonymized, aggregated data (without names or identifying details) for research purposes to improve athlete health and safety. This data will never contain personally identifiable information.
              </p>
              <p>
                <strong>Your Rights:</strong> You have the right to access, correct, or delete your personal information. You can also withdraw your consent at any time by contacting us.
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Disclaimer</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                <strong>Medical Disclaimer:</strong> Next Play Recovery is for informational use only and does not provide medical advice. The information provided through this application is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
              </p>
              <p>
                <strong>No Medical Relationship:</strong> Use of this application does not create a doctor-patient relationship. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
              <p>
                <strong>Accuracy of Information:</strong> While we strive to provide accurate and up-to-date information, we make no representations or warranties about the accuracy, completeness, or suitability of the information contained in this application.
              </p>
              <p>
                <strong>Limitation of Liability:</strong> In no event shall Next Play Recovery be liable for any damages arising out of the use or inability to use the materials on this application, even if Next Play Recovery or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
              <p>
                <strong>External Links:</strong> This application may contain links to external websites. We are not responsible for the content or privacy practices of these external sites.
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
