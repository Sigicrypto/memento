"use client";

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="nm-page px-4 py-12">
      <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-sm mb-6 transition-colors" style={{color:'var(--text2)'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-2" style={{color:'var(--text1)'}}>Privacy Policy</h1>
            <p style={{color:'var(--text2)'}}>Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="nm-card p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>1. Information We Collect</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>We collect minimal information to provide our service:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Email address</strong> - For account creation and authentication</li>
                  <li><strong>Event details</strong> - Event name, custom slug, password protection</li>
                  <li><strong>Photos, videos and captions</strong> - Uploaded by guests to event walls (User-Generated Content)</li>
                  <li><strong>Guest names</strong> - Optional names provided by uploaders</li>
                  <li><strong>Facial Verification Data</strong> - Only collected temporarily if you use the "Find My Photos" selfie feature, deleted immediately after matching.</li>
                  <li><strong>Usage data</strong> - Basic analytics to improve our service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>2. How We Use Your Information</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
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
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>3. Data Storage and Security</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
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
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>4. Data Retention</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>Photos and event data are retained based on your subscription plan:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Free / Starter Plans</strong>: Photos retained for 1 month (30 days)</li>
                  <li><strong>Standard Plan</strong>: Photos retained for 3 months (90 days)</li>
                  <li><strong>Premium / White Label Plans</strong>: Photos retained for 6 months (180 days)</li>
                </ul>
                <p>You can delete your event and all associated photos at any time. Memento claims no ownership over your User-Generated Content.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>5. Third-Party Services</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>We use the following third-party services:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Supabase</strong> - Database and authentication</li>
                  <li><strong>Cloud Storage</strong> - Photo and video storage</li>
                  <li><strong>Payment processors</strong> - For subscription payments</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>6. Your Rights</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
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
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>7. Children's Privacy</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>8. Changes to This Policy</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>We may update this privacy policy from time to time. We will notify users of significant changes via email or by posting a notice on our website.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>9. Contact Us</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
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
  );
}

