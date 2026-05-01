import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import Layout from '../../components/Layout'
import { BLOG_POSTS } from '../../data/siteData'

function PostCard({ post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group glass rounded-2xl overflow-hidden border border-white/8 card-hover block">
      <div className="relative h-52 overflow-hidden">
        <Image src={post.photo} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-heading font-semibold bg-orange-500/80 text-white">{post.category}</span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 text-white/40 text-xs font-body mb-3">
          <span>{new Date(post.date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock size={11} />{post.readTime}</span>
        </div>
        <h3 className="font-heading font-bold text-white text-lg leading-snug mb-3 group-hover:text-orange-400 transition-colors">{post.title}</h3>
        <p className="font-body text-white/50 text-sm leading-relaxed mb-4">{post.excerpt}</p>
        <span className="inline-flex items-center gap-1.5 text-orange-400 text-sm font-heading font-medium group-hover:gap-3 transition-all">
          Read more <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  )
}

export default function Blog() {
  const [featured, ...rest] = BLOG_POSTS

  return (
    <Layout title="Blog" description="ShiftBuddys blog — mental health, family connection, financial wellness, and Fort McMurray life for oilsands rotation workers.">

      {/* Header */}
      <section className="pt-32 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="section-label mb-5">From the community</div>
          <h1 className="font-display text-7xl sm:text-8xl text-white mb-5">
            The ShiftBuddys<br /><span className="text-gradient">Journal</span>
          </h1>
          <p className="font-body text-white/60 text-lg">
            Real articles about the rotation worker life — mental health, money, family, and Fort McMurray.
          </p>
        </div>
      </section>

      {/* Featured post */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/blog/${featured.slug}`} className="group glass rounded-3xl overflow-hidden border border-white/8 card-hover block">
            <div className="grid lg:grid-cols-2">
              <div className="relative h-72 lg:h-auto">
                <Image src={featured.photo} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-navy-900/80 hidden lg:block" />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-heading font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">{featured.category}</span>
                  <span className="text-white/30 text-xs font-body">Featured</span>
                </div>
                <h2 className="font-heading font-bold text-white text-2xl sm:text-3xl leading-snug mb-4 group-hover:text-orange-400 transition-colors">{featured.title}</h2>
                <p className="font-body text-white/60 leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 text-orange-400 font-heading font-medium group-hover:gap-3 transition-all">
                    Read article <ArrowRight size={16} />
                  </span>
                  <span className="text-white/30 text-sm font-body flex items-center gap-1.5"><Clock size={12} />{featured.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Post grid */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(post => <PostCard key={post.slug} post={post} />)}
          </div>
        </div>
      </section>

      {/* Newsletter strip */}
      <section className="py-20 bg-navy-900/50 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-5xl text-white mb-3">Get new articles first.</h2>
          <p className="font-body text-white/50 mb-8">No spam. Just useful content for the rotation worker life.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input type="email" placeholder="your@email.com" className="input-field flex-1" />
            <button className="btn-primary whitespace-nowrap">Subscribe</button>
          </div>
        </div>
      </section>

    </Layout>
  )
}
