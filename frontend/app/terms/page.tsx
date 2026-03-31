"use client";

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="nm-page px-4 py-12">
      <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-sm mb-6 transition-colors" style={{color:'var(--text2)'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-2" style={{color:'var(--text1)'}}>Terms of Service</h1>
            <p style={{color:'var(--text2)'}}>Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="nm-card p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>1. Acceptance of Terms</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>By accessing and using Memento, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>2. Description of Service</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>Memento is a QR-based live photo sharing service that allows event organizers to create photo walls where guests can upload and view photos in real-time.</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Create event walls with custom names and passwords</li>
                  <li>Generate QR codes for easy guest access</li>
                  <li>Real-time photo and video uploads</li>
                  <li>Photo moderation and management tools</li>
                  <li>Download complete photo collections</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>3. User Accounts</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>To use certain features, you must create an account:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must be at least 13 years old to create an account</li>
                  <li>You may not share login credentials with others</li>
                  <li>You may not create multiple accounts to bypass limitations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>4. Payment and Subscription</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>We offer free and paid subscription plans:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Free Plan</strong>: Limited features, 30-day photo retention</li>
                  <li><strong>Premium Plan</strong>: Enhanced features, 1-year photo retention</li>
                  <li><strong>Signature Plan</strong>: All features, 3-year photo retention</li>
                  <li>Payments are processed through secure third-party processors</li>
                  <li>Subscriptions are one-time payments per event</li>
                  <li>No automatic renewals or recurring charges</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>5. User Content and Conduct</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>You are strictly responsible for all User-Generated Content (UGC) you and your guests upload to your event walls. Memento operates a zero-tolerance policy for abusive, illegal, or explicit content:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must own or have explicit permission to upload all photos/videos.</li>
                  <li><strong>Zero Tolerance for Illegal/Explicit Content:</strong> You may not upload pornographic, sexually explicit material, violence, hate speech, or any illegal content.</li>
                  <li><strong>Moderation:</strong> Event hosts are required to moderate their walls using our provided moderation tools. Memento reserves the right to actively monitor, review, and permanently delete any wall, photo, or account that violates these terms without prior notice or refund.</li>
                  <li>You must respect the privacy and rights of others depicted in the photos.</li>
                  <li>We provide an automated Safety Filter and manual Moderation UI to assist you, but the ultimate responsibility of published imagery lies with the Event Host.</li>
                  <li>You grant Memento a temporary license to process and display this content solely to provide the service to you.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>6. Intellectual Property</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You retain ownership of all content you upload</li>
                  <li>We own the Memento service and related intellectual property</li>
                  <li>You may not copy, modify, or redistribute our service</li>
                  <li>Our branding and trademarks may not be used without permission</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>7. Privacy</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>8. Service Availability</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We strive to maintain high service availability</li>
                  <li>Service may be temporarily unavailable for maintenance</li>
                  <li>We are not liable for service interruptions</li>
                  <li>We may discontinue features or the entire service with notice</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>9. Limitation of Liability</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>To the fullest extent permitted by law:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Our service is provided "as is" without warranties</li>
                  <li>We are not liable for any indirect, incidental, or consequential damages</li>
                  <li>Our total liability shall not exceed the amount paid for the service</li>
                  <li>Some jurisdictions do not allow limitation of liability</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>10. Termination</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You may delete your account at any time</li>
                  <li>We may suspend or terminate accounts for violations</li>
                  <li>Upon termination, your content may be deleted</li>
                  <li>These terms survive termination where applicable</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>11. Changes to Terms</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>We may update these terms periodically. We will notify users of significant changes via email or by posting a notice on our website. Continued use of the service constitutes acceptance of updated terms.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{color:'var(--text1)'}}>12. Contact Information</h2>
              <div className="space-y-4" style={{color:'var(--text2)'}}>
                <p>For questions about these terms, please contact us:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email: support@memento.app</li>
                  <li>WhatsApp: +968 96095692</li>
                </ul>
              </div>
            </section>
          </div>
      </div>
    </div>
  );
}

