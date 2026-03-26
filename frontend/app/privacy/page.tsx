"use client";

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="relative z-10 min-h-screen px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-white/70">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Content */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-white/80">
                <p>We collect minimal information to provide our service:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Email address</strong> - For account creation and authentication</li>
                  <li><strong>Event details</strong> - Event name, custom slug, password protection</li>
                  <li><strong>Photos and videos</strong> - Uploaded by guests to event walls</li>
                  <li><strong>Guest names</strong> - Optional names provided by uploaders</li>
                  <li><strong>Usage data</strong> - Basic analytics to improve our service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-white/80">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>To create and manage your event walls</li>
                  <li>To authenticate users and prevent unauthorized access</li>
                  <li>To display photos in real-time galleries</li>
                  <li>To send important service notifications</li>
                  <li>To improve and maintain our service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Data Storage and Security</h2>
              <div className="space-y-4 text-white/80">
                <p>We take data security seriously:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All data is encrypted in transit (HTTPS)</li>
                  <li>Photos are stored securely in cloud storage</li>
                  <li>Access to event walls requires correct password or authentication</li>
                  <li>We implement industry-standard security measures</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Retention</h2>
              <div className="space-y-4 text-white/80">
                <p>Photos and event data are retained based on your subscription plan:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Free events</strong>: Photos retained for 30 days</li>
                  <li><strong>Premium plans</strong>: Photos retained for 1 year</li>
                  <li><strong>Signature plan</strong>: Photos retained for 3 years</li>
                </ul>
                <p>You can delete your event and all associated photos at any time.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Services</h2>
              <div className="space-y-4 text-white/80">
                <p>We use the following third-party services:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Supabase</strong> - Database and authentication</li>
                  <li><strong>Cloud Storage</strong> - Photo and video storage</li>
                  <li><strong>Payment processors</strong> - For subscription payments</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
              <div className="space-y-4 text-white/80">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Children's Privacy</h2>
              <div className="space-y-4 text-white/80">
                <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to This Policy</h2>
              <div className="space-y-4 text-white/80">
                <p>We may update this privacy policy from time to time. We will notify users of significant changes via email or by posting a notice on our website.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Us</h2>
              <div className="space-y-4 text-white/80">
                <p>If you have questions about this privacy policy, please contact us:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email: privacy@memento.app</li>
                  <li>WhatsApp: +968 96095692</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
