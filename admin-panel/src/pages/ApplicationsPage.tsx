import { Download, Inbox, SearchX, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader, Card } from '../components/Layout'
import { Button } from '../components/ui/Button'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Listbox } from '../components/ui/Listbox'
import { Pagination } from '../components/ui/Pagination'
import { FilterBar } from '../components/filters/FilterBar'
import { SegmentedControl } from '../components/filters/SegmentedControl'
import { SearchInput } from '../components/filters/SearchInput'
import { EXPERIENCE_OPTIONS } from '../lib/options'
import { useDebounce } from '../lib/useDebounce'
import { usePagination } from '../lib/usePagination'
import { useJournal, fmtDate, RANGE_SEGMENTS, rangeThreshold, type RangeFilter } from '../lib/useJournal'
import { LeadDetail } from './LeadDetail'

type Filters = {
  experience: string // '' = any; else an EXPERIENCE_OPTIONS value
  ageMin: string
  ageMax: string
  slug: string // '' = any; else a vacancy slug (role)
  range: RangeFilter
  search: string
}
const DEFAULT_FILTERS: Filters = { experience: '', ageMin: '', ageMax: '', slug: '', range: 'all', search: '' }

/** Compact min/max age range, styled like the other filter controls. */
function AgeRange({
  min,
  max,
  onMin,
  onMax,
}: {
  min: string
  max: string
  onMin: (v: string) => void
  onMax: (v: string) => void
}) {
  const sanitize = (v: string) => v.replace(/\D/g, '').slice(0, 3)
  const inputClass =
    'h-11 w-16 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 text-center text-sm tabular-nums text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30'
  return (
    <div className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-2 py-1 dark:border-neutral-700">
      <span className="pl-1 text-xs font-semibold text-neutral-400 dark:text-neutral-500">Возраст</span>
      <input
        inputMode="numeric"
        value={min}
        onChange={(e) => onMin(sanitize(e.target.value))}
        placeholder="от"
        aria-label="Возраст от"
        className={inputClass}
      />
      <span className="text-neutral-300 dark:text-neutral-600">–</span>
      <input
        inputMode="numeric"
        value={max}
        onChange={(e) => onMax(sanitize(e.target.value))}
        placeholder="до"
        aria-label="Возраст до"
        className={inputClass}
      />
    </div>
  )
}

export default function ApplicationsPage() {
  const { items, status, load, detailId, setDetailId, toDelete, setToDelete, deleting, confirmDelete } =
    useJournal('application')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const search = useDebounce(filters.search, 250)

  // Facets derived from loaded data (only offer values actually present).
  const experienceFacet = useMemo(() => {
    const present = new Set(items.map((l) => l.experience).filter(Boolean))
    return [
      { value: '', label: 'Любой опыт' },
      ...EXPERIENCE_OPTIONS.filter((e) => present.has(e)).map((e) => ({ value: e, label: e })),
    ]
  }, [items])

  const slugFacet = useMemo(() => {
    const present = Array.from(new Set(items.filter((l) => l.role).map((l) => l.role as string))).sort()
    return [{ value: '', label: 'Все вакансии' }, ...present.map((s) => ({ value: s, label: s }))]
  }, [items])

  const filtersActive =
    filters.experience !== '' ||
    filters.ageMin !== '' ||
    filters.ageMax !== '' ||
    filters.slug !== '' ||
    filters.range !== 'all' ||
    filters.search !== ''

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const threshold = rangeThreshold(filters.range)
    const lo = filters.ageMin ? Number(filters.ageMin) : null
    const hi = filters.ageMax ? Number(filters.ageMax) : null
    return items.filter((l) => {
      if (filters.experience && l.experience !== filters.experience) return false
      if (lo != null && (l.age == null || l.age < lo)) return false
      if (hi != null && (l.age == null || l.age > hi)) return false
      if (filters.slug && l.role !== filters.slug) return false
      if (threshold && new Date(l.created_at).getTime() < threshold) return false
      if (q && !`${l.name} ${l.contact} ${l.phone} ${l.role ?? ''}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, filters.experience, filters.ageMin, filters.ageMax, filters.slug, filters.range, search])

  // Client-side pagination (12/page) over the filtered list; resets to page 1
  // whenever any filter/search changes.
  const pg = usePagination(
    filtered,
    12,
    `${filters.experience}|${filters.ageMin}|${filters.ageMax}|${filters.slug}|${filters.range}|${search}`,
  )

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  return (
    <>
      <PageHeader title="Заявки" subtitle="Отклики на вакансии — опыт, возраст и резюме кандидатов" />

      {status === 'ready' && items.length > 0 && (
        <FilterBar total={pg.total} from={pg.from} to={pg.to} active={filtersActive} onReset={resetFilters}>
          <div className="w-40">
            <Listbox
              ariaLabel="Опыт работы"
              value={filters.experience}
              onChange={(experience) => setFilters((f) => ({ ...f, experience }))}
              options={experienceFacet}
            />
          </div>
          <AgeRange
            min={filters.ageMin}
            max={filters.ageMax}
            onMin={(ageMin) => setFilters((f) => ({ ...f, ageMin }))}
            onMax={(ageMax) => setFilters((f) => ({ ...f, ageMax }))}
          />
          <div className="w-40">
            <Listbox
              ariaLabel="Вакансия"
              value={filters.slug}
              onChange={(slug) => setFilters((f) => ({ ...f, slug }))}
              options={slugFacet}
            />
          </div>
          <SegmentedControl
            ariaLabel="Период"
            value={filters.range}
            onChange={(range) => setFilters((f) => ({ ...f, range }))}
            options={RANGE_SEGMENTS}
          />
          <SearchInput
            className="w-full sm:w-auto sm:min-w-[170px] sm:flex-1"
            ariaLabel="Поиск по имени, контакту, телефону, вакансии"
            placeholder="Имя, контакт, вакансия…"
            value={filters.search}
            onChange={(search) => setFilters((f) => ({ ...f, search }))}
          />
        </FilterBar>
      )}

      <Card>
        {status === 'loading' ? (
          <TableSkeleton rows={6} cols={8} />
        ) : status === 'error' ? (
          <EmptyState
            icon={Inbox}
            title="Не удалось загрузить"
            message="Проверьте, что бэкенд запущен, и попробуйте снова."
            action={<Button variant="secondary" onClick={load}>Повторить</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} title="Откликов пока нет" message="Здесь появятся отклики кандидатов на вакансии." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Ничего не найдено"
            message="Под текущие фильтры нет откликов. Измените условия или сбросьте фильтры."
            action={<Button variant="secondary" onClick={resetFilters}>Сбросить фильтры</Button>}
          />
        ) : (
          <>
          <div className="overflow-hidden">
            <table className="w-full table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  <th className="w-[24%] px-4 py-3 font-semibold sm:w-[18%]">Кандидат</th>
                  <th className="hidden w-[14%] px-4 py-3 font-semibold sm:table-cell">Вакансия</th>
                  <th className="hidden w-[12%] px-4 py-3 font-semibold md:table-cell">Опыт</th>
                  <th className="hidden w-[8%] px-4 py-3 font-semibold md:table-cell">Возраст</th>
                  <th className="hidden w-[14%] px-4 py-3 font-semibold lg:table-cell">Телефон</th>
                  {/* Резюме скрыто на мобайле (есть в детальном просмотре) — иначе
                      колонка наезжает на «Дату». */}
                  <th className="hidden w-[10%] px-4 py-3 font-semibold sm:table-cell sm:w-[9%]">Резюме</th>
                  <th className="w-[40%] px-4 py-3 font-semibold sm:w-[16%]">Дата</th>
                  <th className="w-[14%] px-4 py-3 text-right font-semibold sm:w-[9%]">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {pg.pageItems.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setDetailId(l.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setDetailId(l.id)
                      }
                    }}
                    aria-label={`Открыть отклик «${l.name}»`}
                    className="cursor-pointer outline-none transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 focus-visible:bg-brand-50/60 dark:focus-visible:bg-brand-500/10"
                  >
                    <td className="px-4 py-3.5">
                      <div className="truncate font-semibold text-neutral-900 dark:text-neutral-100">{l.name}</div>
                      <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">{l.contact}</div>
                    </td>
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      {l.role ? (
                        <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {l.role}
                        </span>
                      ) : (
                        <span className="text-neutral-300 dark:text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3.5 md:table-cell">
                      <div className="truncate text-neutral-600 dark:text-neutral-300">{l.experience || '—'}</div>
                    </td>
                    <td className="hidden px-4 py-3.5 tabular-nums text-neutral-600 dark:text-neutral-300 md:table-cell">
                      {l.age != null ? l.age : '—'}
                    </td>
                    <td className="hidden px-4 py-3.5 lg:table-cell">
                      <div className="truncate tabular-nums text-neutral-600 dark:text-neutral-300">{l.phone}</div>
                    </td>
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      {l.resume ? (
                        <a
                          href={l.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/15 px-2.5 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 transition-colors hover:bg-brand-100 dark:hover:bg-brand-500/25"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </a>
                      ) : (
                        <span className="text-neutral-300 dark:text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="truncate whitespace-nowrap tabular-nums text-xs text-neutral-500 dark:text-neutral-400">
                        {fmtDate(l.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setToDelete(l)
                          }}
                          className="rounded-lg p-2 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400"
                          aria-label={`Удалить отклик «${l.name}»`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pg.page} totalPages={pg.totalPages} onChange={pg.setPage} />
          </>
        )}
      </Card>

      <LeadDetail
        id={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        onRequestDelete={(lead) => setToDelete(lead)}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Удалить отклик?"
        message={`Отклик «${toDelete?.name}» будет удалён без возможности восстановления${
          toDelete?.resume ? ', вместе с файлом резюме' : ''
        }.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
