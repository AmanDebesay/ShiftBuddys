import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ─── Primary Meta ──────────────────────────── */}
        <meta charSet="UTF-8" />
        <meta name="description" content="ShiftBuddys — The app built for oilsands rotation workers and their families. Shift scheduling, family sync, financial wellness, mental health, and Fort McMurray life — all in one place." />
        <meta name="keywords" content="ShiftBuddys, oilsands app, rotation worker app, Fort McMurray, shift schedule, family sync, FIFO app, oil worker app, Alberta" />
        <meta name="author" content="ShiftBuddys" />
        <meta name="theme-color" content="#0D2D4E" />

        {/* ─── Open Graph ────────────────────────────── */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shiftbuddys.ca" />
        <meta property="og:title" content="ShiftBuddys — Built for the Patch. Built for Your Life." />
        <meta property="og:description" content="The only app built for the complete life of an oilsands rotation worker. Shift scheduling, family connection, financial wellness, crew network and more." />
        <meta property="og:image" content="/images/og-image.jpg" />

        {/* ─── Twitter Card ──────────────────────────── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ShiftBuddys — Built for the Patch. Built for Your Life." />
        <meta name="twitter:description" content="The only app built for the complete life of an oilsands rotation worker." />
        <meta name="twitter:image" content="/images/og-image.jpg" />

        {/* ─── Favicon ───────────────────────────────── */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />

        {/* ─── Google Fonts preconnect ────────────────── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

        {/* ─── Google Analytics ──────────────────────── */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0L6CNGQ0V6"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-0L6CNGQ0V6');
        `}} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
