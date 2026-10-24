import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/site';
import { getSiteText } from '@/lib/site-text';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RichText } from '@/components/RichText';
import './globals.css';

export function generateMetadata(): Metadata {
  const text = getSiteText();
  return {
    metadataBase: new URL(site.url),
    title: { default: text['site.name'], template: `%s · ${text['site.name']}` },
    description: text['site.description'],
    openGraph: { title: text['site.name'], description: text['site.description'], type: 'website', siteName: text['site.name'] },
    // While the pilot banner is up, Google and Bing are asked not to list the site. Only
    // those two: AI crawlers ignore these tags, so the reviews still reach them.
    ...(text['site.pilotBanner'].trim()
      ? { robots: { googleBot: { index: false } }, other: { bingbot: 'noindex' } }
      : {}),
    twitter: { card: 'summary_large_image' },
  };
}

/**
 * Runs before first paint so the page never flashes the wrong theme. Dark unless this
 * device has chosen light. Kept tiny and dependency-free on purpose.
 */
const themeScript = `(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}document.documentElement.dataset.theme=(t==='light')?'light':'dark'})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const text = getSiteText();
  return (
    // suppressHydrationWarning: data-theme is set by the script above, before React runs.
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link className="site-title" href="/">
              {text['site.name']}
            </Link>
            <nav className="site-nav">
              <Link href="/">{text['nav.reviews']}</Link>
              <Link href="/methods">{text['nav.methods']}</Link>
              <Link href="/about">{text['nav.about']}</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        {text['site.pilotBanner'] && (
          <div className="pilot-banner" role="note">
            <div className="wrap">
              <RichText text={text['site.pilotBanner']} inline />
            </div>
          </div>
        )}

        <main className="wrap">{children}</main>

        <footer className="site-footer">
          <div className="wrap">
            <RichText text={text['site.footer']} />
          </div>
        </footer>
      </body>
    </html>
  );
}
