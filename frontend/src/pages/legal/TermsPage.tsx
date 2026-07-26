import { Link } from 'react-router-dom';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: July 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using HEYLAOS, you agree to be bound by these Terms of Use. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Description of Service</h2>
            <p>HEYLAOS is an all-in-one business management platform offering HR, Payroll, CRM, Accounting, Inventory, EHS, Engineering, Transport, Fuel, Jobs, and Networking modules.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide accurate registration information</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use HEYLAOS in compliance with all applicable laws</li>
              <li>Not misuse the platform for fraudulent or illegal activities</li>
              <li>Not use VPNs or proxies to misrepresent your location</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Account Registration</h2>
            <p>You must be at least 18 years old to register. One account per person or entity. Accounts created through VPNs or proxies may be suspended.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Payments & Subscriptions</h2>
            <p>Paid features require a valid payment method. Subscription fees are charged in your local currency as displayed on the platform. Refund policies are outlined at the point of purchase.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Intellectual Property</h2>
            <p>HEYLAOS and its content, features, and functionality are owned by HEYLAOS and are protected by international copyright and intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
            <p>HEYLAOS is provided "as is" without warranties of any kind. We are not liable for damages arising from your use of the platform, to the maximum extent permitted by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of HEYLAOS after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:legal@heylaos.com" className="text-primary hover:underline">legal@heylaos.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
