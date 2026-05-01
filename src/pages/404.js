import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Layout from '../components/Layout'

export default function NotFound() {
  return (
    <Layout title="Page Not Found">
      <section className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <div className="font-display text-[160px] sm:text-[220px] text-orange-500/10 leading-none select-none mb-4">404</div>
          <h1 className="font-display text-5xl text-white mb-4 -mt-10">Page not found.</h1>
          <p className="font-body text-white/50 text-lg mb-8">Looks like this page went on rotation and didn&apos;t come back.</p>
          <Link href="/" className="btn-primary">
            Back to home <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </Layout>
  )
}
