import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const api = axios.create({ baseURL: API_BASE })

// Minimal fallback for when the backend is unreachable. Only the shape
// needs to match; the real content (functions/disorders) comes from
// backend/data/regions.json via the API.
const FALLBACK_REGIONS = [
  {
    id: 'frontal_lobe',
    name_en: 'Frontal lobe',
    name_ko: '전두엽',
    parent_id: null,
    mesh_name: 'frontal_lobe',
    color: '#4F8EF7',
    description: '백엔드 연결 실패 — regions.json 기반 콘텐츠가 로드되지 않았습니다.',
    functions: [],
    disorders: []
  },
  {
    id: 'cerebellum',
    name_en: 'Cerebellum',
    name_ko: '소뇌',
    parent_id: null,
    mesh_name: 'cerebellum',
    color: '#F7C64F',
    description: '백엔드 연결 실패 — regions.json 기반 콘텐츠가 로드되지 않았습니다.',
    functions: [],
    disorders: []
  }
]

export async function fetchRegions() {
  try {
    const { data } = await api.get('/regions')
    return data.regions ?? []
  } catch {
    return FALLBACK_REGIONS
  }
}

export async function fetchRegion(id) {
  try {
    const { data } = await api.get(`/regions/${id}`)
    return data
  } catch {
    return FALLBACK_REGIONS.find((region) => region.id === id) ?? null
  }
}

export async function searchRegions(q) {
  if (!q) return []
  try {
    const { data } = await api.get('/regions/search', { params: { q } })
    return data.regions ?? []
  } catch {
    const needle = q.toLowerCase()
    return FALLBACK_REGIONS.filter(
      (region) =>
        region.name_en.toLowerCase().includes(needle) ||
        (region.name_ko && region.name_ko.includes(q))
    )
  }
}
