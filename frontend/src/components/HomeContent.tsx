import SiteShell from './SiteShell'
import Hero from './Hero'
import About from './About'
import Services from './Services'
import Process from './Process'
import Portfolio from './Portfolio'
import Partners from './Partners'
import CTA from './CTA'
import { getProjects, SITE_URL } from '../lib/api'

// Home-only structured data. Lives here (not in a global head) so it appears
// once, on the home page, exactly like the Vite app.
const LOCAL_BUSINESS_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Webrand',
  description:
    'Digital-агентство в Душанбе: разработка сайтов, дизайн и брендинг, SMM, онлайн-эквайринг и продвижение для бизнеса.',
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/og-image.png`,
  telephone: '+992988645543',
  email: 'info@webrand.tj',
  areaServed: 'Dushanbe',
  address: { '@type': 'PostalAddress', addressLocality: 'Dushanbe', addressCountry: 'TJ' },
  sameAs: [
    'https://t.me/Webrandushanbe',
    'https://www.instagram.com/webrand.tj',
    'https://wa.me/992985829367',
  ],
}

// Shared by /, /devprojects and /smmprojects — they render identical content;
// only the active portfolio filter (derived client-side from the pathname) and
// the page metadata differ. Projects are fetched server-side for SEO.
export default async function HomeContent() {
  const { data: projects, error } = await getProjects()

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSONLD) }}
      />
      <main>
        <Hero />
        <About />
        <Services />
        <Process />
        <Portfolio initialProjects={projects} initialError={error} />
        <Partners />
        <CTA />
      </main>
    </SiteShell>
  )
}
