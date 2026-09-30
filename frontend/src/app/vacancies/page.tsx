import type { Metadata } from 'next'
import SiteShell from '../../components/SiteShell'
import Careers from '../../components/Careers'
import { getVacancies } from '../../lib/api'
import { pageMetadata } from '../../lib/seo'

// Rendered once and served from the cache; refreshed when the admin saves
// something and re-checked every five minutes (see lib/api.ts, REVALIDATE).
export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: 'Вакансии Webrand — работа в digital-агентстве в Душанбе',
  description:
    'Открытые вакансии Webrand: дизайнер, SMM-специалист, разработчик и другие роли. Присоединяйтесь к команде digital-агентства в Душанбе.',
  path: '/vacancies',
})

export default async function Page() {
  const { data: vacancies, error } = await getVacancies()

  return (
    <SiteShell>
      <main>
        <Careers headingLevel="h1" vacancies={vacancies} error={error} />
      </main>
    </SiteShell>
  )
}
