import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Process from './components/Process'
import Portfolio from './components/Portfolio'
import Partners from './components/Partners'
import Careers from './components/Careers'
import CTA from './components/CTA'
import Footer from './components/Footer'
import ContactModal from './components/ContactModal'
import ServiceDetailModal from './components/ServiceDetailModal'
import NotFound from './components/NotFound'
import News from './pages/News'
import NewsArticlePage from './pages/NewsArticle'
import { Seo } from './components/Seo'
import { ModalProvider } from './context/ModalContext'

// Home-only structured data (moved out of index.html so it appears once, on the
// home page, instead of on every SPA route).
const LOCAL_BUSINESS_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Webrand',
  description:
    'Digital-агентство в Душанбе: разработка сайтов, дизайн и брендинг, SMM, онлайн-эквайринг и продвижение для бизнеса.',
  url: 'https://webrand-flame.vercel.app/',
  image: 'https://webrand-flame.vercel.app/og-image.png',
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

function Home() {
  // /devprojects и /smmprojects — клиентский фильтр того же контента,
  // поэтому canonical у всех трёх роутов указывает на главную.
  return (
    <div className="relative min-h-screen bg-white">
      <Seo
        title="Webrand — Комплексные digital-решения для бизнеса"
        description="Webrand — digital-агентство в Душанбе. Разработка сайтов, дизайн и брендинг, SMM, эквайринг и продвижение для бизнеса."
        path="/"
        jsonLd={LOCAL_BUSINESS_JSONLD}
      />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Process />
        <Portfolio />
        <Partners />
        <CTA />
      </main>
      <Footer />
      <ContactModal />
      <ServiceDetailModal />
    </div>
  )
}

function Vacancies() {
  // Dedicated route for the careers section — reuses the existing Careers
  // component + content.ts data. Land at the top, not at a preserved scroll.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="relative min-h-screen bg-white">
      <Seo
        title="Вакансии Webrand — работа в digital-агентстве в Душанбе"
        description="Открытые вакансии Webrand: дизайнер, SMM-специалист, разработчик и другие роли. Присоединяйтесь к команде digital-агентства в Душанбе."
        path="/vacancies"
      />
      <Navbar />
      <main>
        <Careers headingLevel="h1" />
      </main>
      <Footer />
      <ContactModal />
      <ServiceDetailModal />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ModalProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/devprojects" element={<Home />} />
          <Route path="/smmprojects" element={<Home />} />
          <Route path="/vacancies" element={<Vacancies />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsArticlePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ModalProvider>
    </BrowserRouter>
  )
}

export default App
