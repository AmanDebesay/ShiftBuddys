import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react'
import Layout from '../../components/Layout'
import { BLOG_POSTS } from '../../data/siteData'

// Full blog post content — add more as you write real articles
const POST_CONTENT = {
  'oilsands-mental-health-crisis': `
University of Alberta researchers have documented something Fort McMurray workers have known for years: the rotation lifestyle takes a measurable toll on mental health, relationships, and overall wellbeing.

**The Research Is Clear**

Studies consistently show that oilsands commuter workers experience higher rates of anxiety, depression, and relationship strain than comparable workers in other industries. The combination of extended time away from family, disrupted sleep from 12-hour shifts, and the psychological weight of isolation creates a perfect storm that generic wellness programs completely ignore.

**What Existing Apps Miss**

Current shift scheduling apps — MyShiftPlanner, ShiftSync, MyShiftWork — solve the calendar problem. They don't solve the human problem. None of them address the loneliness of camp life, the emotional toll of missing family milestones, or the specific mental health challenges that rotation workers face.

**What ShiftBuddy Does Differently**

ShiftBuddy's Wellbeing module was designed with this research in mind. The daily mood check-in isn't just data collection — it's a 5-second moment of self-awareness that over time builds a picture of your own rotation patterns. Do you consistently crash on Day 10? Do you sleep worse in summer? The data tells you what your body already knows.

The anonymous peer community is perhaps the most powerful tool. "Anyone else struggling with being away from the kids?" is a question thousands of workers silently ask themselves every rotation. A moderated, anonymous space to ask it — and get genuine answers from people who understand — creates belonging that no counsellor visit can replicate.

**Crisis Support Is Always Visible**

One-tap access to Alberta 211, crisis lines, and EAP numbers is prominently placed, not buried three menus deep. Because help should never be hard to find.

If you're a rotation worker and this resonates, join our waitlist. The app is coming.
  `,
  'coming-home-reintegration': `
After 14 days in camp, the moment you should feel most relief — stepping through your front door — is often when rotation workers feel most disoriented.

**The Reintegration Gap Nobody Talks About**

Research on FIFO (fly-in, fly-out) workers consistently identifies the first 24–72 hours at home as one of the most psychologically complex periods of the rotation cycle. Workers have been in "production mode" for two weeks. Partners have built routines without them. Kids have changed in small but real ways. Everyone has adapted — and now the family needs to adapt again.

This isn't a failure. It's a predictable pattern. And it can be managed if you know it's coming.

**What Coming Home Mode Does**

ShiftBuddy's Coming Home Mode activates 48 hours before your rotation ends. It doesn't wait until you're standing at baggage claim wondering why you feel like a stranger in your own life.

For the worker, it offers gentle prompts: What's one thing you want to do in the first hour? What do you need from your partner to feel settled? Conversation starters that don't require you to have the right words ready after two weeks of 12-hour shifts.

For the partner, it offers their own parallel prompts. Because they've been managing everything alone and they have things they need to say too. The app doesn't tell them what to feel — it just opens the door.

**The Reintegration Checklist**

Optional, not preachy. But workers who use it report that having a simple framework — decompress time, first family activity, agreement to not make big decisions in the first 24 hours — takes the pressure off both sides.

The goal isn't perfection. It's just a better first 24 hours.
  `,
  'oilsands-financial-planning': `
Fort McMurray has more high-income earners per capita than almost anywhere in Canada. It also has surprisingly high rates of financial stress among those same earners.

**The Rotation Spending Pattern**

The psychology is straightforward once you see it. After 14 days of working 12-hour shifts in camp with no place to spend money, the days-off week arrives and the pendulum swings hard. Restaurants every night. New gear. Trips. Things for the house. Things for the kids. Because you weren't there to experience the small joys, the big purchases become a way of showing love — and of rewarding yourself for the sacrifice.

It's not irresponsibility. It's a predictable human response to an unusual lifestyle.

**The Numbers Don't Lie**

A worker earning $130,000 annually with 52 days-off weeks per year has roughly $2,500 available per off-week after tax, pension, and fixed costs. That's genuinely not much when you're trying to compress a full life into seven days.

The issue isn't the spending itself — it's the absence of a plan. Without a target, the money disappears. And at the end of 20 years in the patch, the math doesn't add up to the life they imagined.

**What ShiftBuddy Does**

The Money Manager module isn't a bank. It doesn't link to your accounts or send judgment. It's a simple, visual tracker that shows you what your rotation is worth and where it's going.

The Days Off Spending Alert sends a notification when you hit 75% of your self-set cap. Not a lecture — just a number. Information is enough for most people to pause and make a better choice.

The savings goal tracker shows your progress toward things that actually matter: emergency fund, vehicle paid off, down payment, retirement. Seeing $47,000 earned this rotation cycle is motivating in a way that a bank statement never is.

**Get Started**

The first step is just setting a rotation budget. You probably already have a number in your head. Write it down in ShiftBuddy and let it hold you to it.
  `,
  'fort-mcmurray-newcomer-guide': `
If you've just landed your first oilsands job and you're moving to Fort McMurray, welcome. Here's what nobody tells you until you're already scrambling.

**Your Alberta Driver's Licence**

If you're from another province, you have 90 days to exchange your licence before you technically need to drive on a temporary permit. Head to a registry office in Fort McMurray — there are several — with your current licence and proof of identity. If you're coming from outside Canada, bring your foreign licence and an official translation if it's not in English or French. The process is straightforward but takes a visit.

**Finding a Family Doctor**

This is genuinely hard in Fort McMurray. The Northern Lights Health Foundation (the main hospital and healthcare network) has a patient registry for people without a doctor. Register there immediately — wait times can be months. In the meantime, the walk-in clinic on Hardin Street is your first stop for non-emergency care.

**Registering Kids for School**

Fort McMurray has two school boards: Fort McMurray Public School District and Fort McMurray Catholic School District. Both accept registration year-round online. You'll need proof of address and immunization records. School boundaries are real here — the neighbourhood you live in determines which school your kids attend.

**Best Neighbourhoods**

Timberlea and Thickwood are popular with families — newer housing stock, good schools, quiet streets. Abasand is more affordable and central. Parsons North is newer and further out but family-oriented. Downtown/Waterways has character and is walkable. Avoid signing a long lease before your first rotation — spend a few months in a furnished place and see what fits your life.

**Getting to Site**

Most workers commute via company-chartered buses from designated pickup points in town, or fly in from Edmonton/Calgary. Confirm with your employer before making any assumptions. Highway 63 to site is a serious drive in winter — if you're driving yourself, get proper tires before October.

**The ShiftBuddy newcomer guide covers all of this and more**, including local resources, recreation passes, and how to navigate the RMWB (the municipal government). Join the waitlist to be first in line when the app launches.
  `,
}

export default function BlogPost({ post, content, related }) {
  if (!post) return null

  return (
    <Layout title={post.title} description={post.excerpt}>

      {/* Back */}
      <div className="pt-28 pb-6">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-orange-400 text-sm font-heading transition-colors">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </div>

      {/* Header */}
      <section className="pb-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-5">
            <span className="px-3 py-1 rounded-full text-xs font-heading font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">{post.category}</span>
            <span className="text-white/40 text-xs font-body flex items-center gap-1.5"><Clock size={11} />{post.readTime}</span>
            <span className="text-white/30 text-xs font-body">{new Date(post.date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="font-heading font-bold text-white text-4xl sm:text-5xl leading-tight mb-5">{post.title}</h1>
          <p className="font-body text-white/60 text-xl leading-relaxed">{post.excerpt}</p>
        </div>
      </section>

      {/* Hero image */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden">
          <Image src={post.photo} alt={post.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent" />
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 pb-20">
        <div className="font-body text-white/70 text-lg leading-relaxed space-y-6">
          {content.trim().split('\n\n').map((para, i) => {
            if (para.startsWith('**') && para.endsWith('**')) {
              return <h2 key={i} className="font-heading font-bold text-white text-2xl mt-10 mb-4">{para.replace(/\*\*/g, '')}</h2>
            }
            const formatted = para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
            return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
          })}
        </div>
      </article>

      {/* CTA */}
      <section className="py-16 bg-navy-900/50 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-5xl text-white mb-3">Ready to start your countdown?</h2>
          <Link href="/contact" className="btn-primary mt-6 inline-flex">
            Join the Waitlist <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h3 className="font-heading font-bold text-white text-xl mb-8">More from the journal</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {related.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group glass rounded-2xl overflow-hidden border border-white/8 card-hover flex gap-5 p-5">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={p.photo} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div>
                    <span className="text-orange-400 text-xs font-heading font-medium">{p.category}</span>
                    <h4 className="font-heading font-semibold text-white text-sm leading-snug mt-1 group-hover:text-orange-400 transition-colors">{p.title}</h4>
                    <p className="font-body text-white/40 text-xs mt-1">{p.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </Layout>
  )
}

export async function getStaticPaths() {
  return {
    paths: BLOG_POSTS.map(p => ({ params: { slug: p.slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const post = BLOG_POSTS.find(p => p.slug === params.slug) || null
  const content = POST_CONTENT[params.slug] || 'Full article coming soon.'
  const related = BLOG_POSTS.filter(p => p.slug !== params.slug).slice(0, 2)
  return { props: { post, content, related } }
}
