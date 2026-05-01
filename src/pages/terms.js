import Layout from '../components/Layout'

export default function Terms() {
  return (
    <Layout title="Terms of Service" description="ShiftBuddys Terms of Service.">
      <section className="pt-32 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-label mb-5">Legal</div>
        <h1 className="font-display text-6xl text-white mb-8">Terms of Service</h1>
        <div className="font-body text-white/60 text-sm leading-relaxed space-y-6">
          <p className="text-white/40 text-xs">Last updated: January 1, 2025</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">1. Acceptance of Terms</h2>
          <p>By downloading or using ShiftBuddys, you agree to these Terms of Service. If you do not agree, do not use the app.</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">2. Use of the App</h2>
          <p>ShiftBuddys is intended for personal use by rotation workers and their families. You may not use the app for any unlawful purpose or in any way that could damage or impair the service.</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">3. Mental Health Disclaimer</h2>
          <p>ShiftBuddys is not a medical service and does not provide clinical mental health support. The Wellbeing module is a personal wellness tracking tool. In a mental health emergency, please contact Alberta 211 or emergency services (911) immediately. Crisis resources are accessible directly within the app.</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">4. Financial Information</h2>
          <p>ShiftBuddys's Money Manager is a personal tracking tool and does not constitute financial advice. We are not a licensed financial institution. For financial planning, consult a licensed financial advisor.</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">5. Subscriptions</h2>
          <p>Premium subscriptions are billed monthly or annually as selected. You may cancel at any time. Cancellation takes effect at the end of the current billing period. No refunds are issued for partial periods.</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">6. Intellectual Property</h2>
          <p>All content, design, and code within ShiftBuddys is the intellectual property of ShiftBuddys Inc. You may not reproduce, distribute, or create derivative works without written permission.</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">7. Governing Law</h2>
          <p>These Terms are governed by the laws of the Province of Alberta and the federal laws of Canada applicable therein.</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">8. Contact</h2>
          <p>For terms questions: <a href="mailto:legal@shiftbuddys.ca" className="text-orange-400 hover:text-orange-300">legal@shiftbuddys.ca</a></p>
        </div>
      </section>
    </Layout>
  )
}
