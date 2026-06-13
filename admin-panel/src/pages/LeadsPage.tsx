import { Inbox, SearchX, Trash2 } from 'lucide-react'
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
import { LEAD_DIRECTIONS, LEAD_DIRECTION_LABEL } from '../lib/options'
import { useDebounce } from '../lib/useDebounce'
import { usePagination } from '../lib/usePagination'
import { useJournal, fmtDate, RANGE_SEGMENTS, rangeThreshold, type RangeFilter } from '../lib/useJournal'
import { LeadDetail } from './LeadDetail'

type Filters = {
  direction: string // '' = any; else a LEAD_DIRECTIONS value
  range: RangeFilter
  search: string
}
const DEFAULT_FILTERS: Filters = { direction: '', range: 'all', search: '' }

export default function LeadsPage() {
  const { items, status, load, detailId, setDetailId, toDelete, setToDelete, deleting, confirmDelete } =
    useJournal('lead')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const search = useDebounce(filters.search, 250)

  // Directions facet: union of `selected` across leads, ordered by the contract;
  // only offer directions actually present in the data.
  const directionFacet = useMemo(() => {
    const present = new Set<string>()
    items.forEach((l) => (l.selected ?? []).forEach((s) => present.add(s)))
    return [
      { value: '', label: 'Все направления' },
      ...LEAD_DIRECTIONS.filter((d) => present.has(d)).map((d) => ({ value: d, label: LEAD_DIRECTION_LABEL[d] })),
    ]
  }, [items])

  const filtersActive = filters.direction !== '' || filters.range !== 'all' || filters.search !== ''

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const threshold = rangeThreshold(filters.range)
    return items.filter((l) => {
      if (filters.direction && !(l.selected ?? []).includes(filters.direction)) return false
      if (threshold && new Date(l.created_at).getTime() < threshold) return false
      if (q && !`${l.name} ${l.contact} ${l.phone} ${l.message}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, filters.direction, filters.range, search])

  // Client-side pagination (12/page) over the filtered list; snaps to page 1
  // whenever the filters/search change.
  const pg = usePagination(filtered, 12, `${filters.direction}|${filters.range}|${search}`)

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  return (
    <>
      <PageHeader title="Заявки" subtitle="Общие заявки с форм сайта и квиза (уходят в Telegram)" />

      {status === 'ready' && items.length > 0 && (
        <FilterBar total={pg.total} from={pg.from} to={pg.to} active={filtersActive} onReset={resetFilters}>
          <div className="w-44">
            <Listbox
              ariaLabel="Направление"
              value={filters.direction}
              onChange={(direction) => setFilters((f) => ({ ...f, direction }))}
              options={directionFacet}
            />
          </div>
          <SegmentedControl
            ariaLabel="Период"
            value={filters.range}
            onChange={(range) => setFilters((f) => ({ ...f, range }))}
            options={RANGE_SEGMENTS}
          />
          <SearchInput
            className="min-w-[180px] flex-1"
            ariaLabel="Поиск по имени, контакту, телефону, сообщению"
            placeholder="Имя, контакт, сообщение…"
            value={filters.search}
            onChange={(search) => setFilters((f) => ({ ...f, search }))}
          />
        </FilterBar>
      )}

      <Card>
        {status === 'loading' ? (
          <TableSkeleton rows={6} cols={7} />
        ) : status === 'error' ? (
          <EmptyState
            icon={Inbox}
            title="Не удалось загрузить"
            message="Проверьте, что бэкенд запущен, и попробуйте снова."
            action={<Button variant="secondary" onClick={load}>Повторить</Button>}
          />
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} title="Заявок пока нет" message="Здесь появятся заявки с формы и квиза «Расскажите о задаче»." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Ничего не найдено"
            message="Под текущие фильтры нет заявок. Измените условия или сбросьте фильтры."
            action={<Button variant="secondary" onClick={resetFilters}>Сбросить фильтры</Button>}
          />
        ) : (
          <>
          <div className="overflow-hidden">
            <table className="w-full table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  <th className="w-[24%] px-4 py-3 font-semibold sm:w-[18%]">Имя</th>
                  <th className="hidden w-[16%] px-4 py-3 font-semibold md:table-cell">Контакт</th>
                  <th className="hidden w-[13%] px-4 py-3 font-semibold sm:table-cell">Телефон</th>
                  <th className="hidden w-[16%] px-4 py-3 font-semibold lg:table-cell">Направления</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Сообщение</th>
                  <th className="w-[28%] px-4 py-3 font-semibold sm:w-[16%]">Дата</th>
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
                    aria-label={`Открыть заявку «${l.name}»`}
                    className="cursor-pointer outline-none transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 focus-visible:bg-brand-50/60 dark:focus-visible:bg-brand-500/10"
                  >
                    <td className="px-4 py-3.5">
                      <div className="truncate font-semibold text-neutral-900 dark:text-neutral-100">{l.name}</div>
                    </td>
                    <td className="hidden px-4 py-3.5 md:table-cell">
                      <div className="truncate text-neutral-600 dark:text-neutral-300">{l.contact}</div>
                    </td>
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      <div className="truncate tabular-nums text-neutral-600 dark:text-neutral-300">{l.phone}</div>
                    </td>
                    <td className="hidden px-4 py-3.5 lg:table-cell">
                      {l.selected?.length ? (
                        <div className="truncate text-neutral-600 dark:text-neutral-300">
                          {l.selected.map((s) => LEAD_DIRECTION_LABEL[s] ?? s).join(', ')}
                        </div>
                      ) : (
                        <span className="text-neutral-300 dark:text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3.5 lg:table-cell">
                      <div className="truncate text-neutral-600 dark:text-neutral-300">
                        {l.message ? l.message : <span className="text-neutral-300 dark:text-neutral-600">—</span>}
                      </div>
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
                          aria-label={`Удалить заявку «${l.name}»`}
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
        title="Удалить заявку?"
        message={`Заявка «${toDelete?.name}» будет удалена без возможности восстановления.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
