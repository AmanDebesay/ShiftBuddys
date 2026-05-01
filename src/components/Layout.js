import Navbar from './Navbar'
import Footer from './Footer'
import Head from 'next/head'
import { SITE } from '../data/siteData'

export default function Layout({ children, title, description, noFooter = false }) {
  const pageTitle = title ? `${title} — ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`
  const pageDesc = description || SITE.description

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
      </Head>
      <Navbar />
      <main>{children}</main>
      {!noFooter && <Footer />}
    </>
  )
}
