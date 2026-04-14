import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const api = axios.create({ baseURL: API_BASE })

const FALLBACK_REGIONS = [
  {
    id: 'frontal_lobe',
    name_en: 'Frontal lobe',
    name_ko: '전두엽',
    parent_id: null,
    mesh_name: 'frontal_lobe',
    color: '#4F8EF7',
    description: '의사결정, 실행 기능, 운동 계획과 관련된 영역입니다.',
    functions: [],
    disorders: []
  },
  {
    id: 'temporal_lobe',
    name_en: 'Temporal lobe',
    name_ko: '측두엽',
    parent_id: null,
    mesh_name: 'temporal_lobe',
    color: '#F77F4F',
    description: '청각 처리, 언어 이해, 기억 형성과 관련된 영역입니다.',
    functions: [],
    disorders: []
  },
  {
    id: 'parietal_lobe',
    name_en: 'Parietal lobe',
    name_ko: '두정엽',
    parent_id: null,
    mesh_name: 'parietal_lobe',
    color: '#4FD1A1',
    description: '감각 통합, 공간 인지, 주의 전환과 관련된 영역입니다.',
    functions: [],
    disorders: []
  },
  {
    id: 'occipital_lobe',
    name_en: 'Occipital lobe',
    name_ko: '후두엽',
    parent_id: null,
    mesh_name: 'occipital_lobe',
    color: '#B94FF7',
    description: '시각 정보 처리의 핵심 영역입니다.',
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
    description: '운동 조절, 균형, 타이밍 정밀도와 관련된 영역입니다.',
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
