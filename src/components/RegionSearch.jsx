import { useEffect, useState } from 'react'
import { AutoComplete, Input } from 'antd'
import { searchRegions } from '../lib/api'

// Debounced search over /api/regions/search. Picking an entry fires
// onSelectRegion, which already triggers tree auto-expand and camera focus
// via the state wiring in App.jsx.
export function RegionSearch({ onSelectRegion }) {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState([])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setOptions([])
      return undefined
    }
    let cancelled = false
    const timer = setTimeout(() => {
      searchRegions(trimmed).then((rows) => {
        if (cancelled) return
        setOptions(
          rows.map((r) => ({
            value: r.id,
            label: `${r.name_en}${r.name_ko ? ` (${r.name_ko})` : ''}`
          }))
        )
      })
    }, 180)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  return (
    <AutoComplete
      value={query}
      options={options}
      onSearch={setQuery}
      onChange={setQuery}
      onSelect={(value) => {
        onSelectRegion(value)
        setQuery('')
        setOptions([])
      }}
      style={{ width: '100%' }}
      notFoundContent={query.trim() ? '일치하는 영역 없음' : null}
    >
      <Input.Search placeholder="영역 검색 (예: 해마, frontal)" allowClear />
    </AutoComplete>
  )
}
