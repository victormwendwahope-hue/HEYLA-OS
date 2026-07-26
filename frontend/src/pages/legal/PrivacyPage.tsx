import { Link } from '@tanstack/react-router';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to HEYLAOS
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png?v=3" alt="HEYLA" className="w-10 h-10" />
          <span className="text-xl font-bold">HEYLA<span className="text-primary"> OS</span></span>
        </div>
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: July 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your name, email address, phone number, and company details when you register or use HEYLAOS.</p>
            <p className="mt-2">We also automatically collect certain technical data, including your IP address, browser type, device information, and usage patterns through essential cookies and analytics tools with your consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide, maintain, and improve HEYLAOS services</li>
              <li>Process transactions and send related communications</li>
              <li>Detect and prevent fraud, abuse, or security incidents</li>
              <li>Comply with legal obligations in your jurisdiction</li>
              <li>With your consent, show relevant ads and content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Data Sharing & Disclosure</h2>
            <p>We do not sell your personal data. We may share information with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Service providers who help operate HEYLAOS (hosting, payments, analytics)</li>
              <li>Legal authorities when required by applicable law</li>
              <li>Business partners only with your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Retention</h2>
            <p>We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or port your data. Contact us at <a href="mailto:privacy@heylaos.com" className="text-primary hover:underline">privacy@heylaos.com</a> to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Cookies</h2>
            <p>HEYLAOS uses essential cookies for authentication and security. With your consent, we also use analytics and advertising cookies to improve your experience. You can manage your preferences at any time using the cookie consent banner.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Security</h2>
            <p>We implement industry-standard security measures including encryption at rest and in transit, regular security audits, and access controls to protect your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Contact</h2>
            <p>For privacy-related inquiries, contact us at <a href="mailto:privacy@heylaos.com" className="text-primary hover:underline">privacy@heylaos.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
