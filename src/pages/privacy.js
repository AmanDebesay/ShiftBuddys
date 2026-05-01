import Layout from '../components/Layout'

export default function Privacy() {
  return (
    <Layout title="Privacy Policy" description="ShiftBuddys Privacy Policy — how we collect, use, and protect your data.">
      <section className="pt-32 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-label mb-5">Legal</div>
        <h1 className="font-display text-6xl text-white mb-8">Privacy Policy</h1>
        <div className="font-body text-white/60 text-sm leading-relaxed space-y-6">
          <p className="text-white/40 text-xs">Last updated: January 1, 2025</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">1. What We Collect</h2>
          <p>ShiftBuddys collects information you provide directly — your name, email address, rotation schedule, and any content you enter into the app (mood logs, journal entries, financial data). We also collect basic usage analytics to improve the app.</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">2. The Employer Privacy Guarantee</h2>
          <p>If your employer has licensed ShiftBuddys for your workforce: <strong className="text-white">your individual data is never shared with your employer under any circumstances.</strong> Employers receive only anonymized aggregate data — team-level trends with no individual identification possible. This is a binding contractual commitment in all enterprise agreements.</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">3. How We Use Your Data</h2>
          <p>We use your data to provide and improve ShiftBuddys's features. We do not sell your personal information to any third party. Financial advisor referrals are opt-in only — we never share your data with partners without your explicit consent.</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">4. Data Storage &amp; Security</h2>
          <p>All data is stored on Canadian servers (AWS ca-central-1 Montreal region) in compliance with PIPEDA and Alberta PIPA. Data is encrypted at rest and in transit using industry-standard AES-256 encryption.</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">5. Your Rights</h2>
          <p>You have the right to access, correct, export, or delete all your personal data at any time. In-app controls allow you to manage your data directly. To request deletion, contact us at privacy@shiftbuddys.ca.</p>

          <h2 className="font-heading font-bold text-white text-xl mt-8">6. Contact</h2>
          <p>For privacy questions: <a href="mailto:privacy@shiftbuddys.ca" className="text-orange-400 hover:text-orange-300">privacy@shiftbuddys.ca</a><br />
          ShiftBuddys, Fort McMurray, Alberta, Canada</p>
        </div>
      </section>
    </Layout>
  )
}
