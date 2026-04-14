import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const api = axios.create({ baseURL: API_BASE })

export async function fetchExpressionData(params) {
  try {
    const { data } = await api.get('/expression', { params })
    return data
  } catch {
    return {
      records: [
        { region: 'Frontal lobe', Allen: 542, GTEx: 494, HPA: 338, MANE: 619, NCBI: 455 },
        { region: 'Temporal lobe', Allen: 417, GTEx: 402, HPA: 291, MANE: 511, NCBI: 389 },
        { region: 'Parietal lobe', Allen: 309, GTEx: 287, HPA: 251, MANE: 418, NCBI: 300 },
        { region: 'Occipital lobe', Allen: 288, GTEx: 264, HPA: 244, MANE: 374, NCBI: 278 },
        { region: 'Cerebellum', Allen: 621, GTEx: 580, HPA: 401, MANE: 690, NCBI: 533 }
      ]
    }
  }
}

export async function fetchSetData(params) {
  try {
    const { data } = await api.get('/sets', { params })
    return data
  } catch {
    return {
      sets: [
        { sets: ['Allen'], size: 1450 },
        { sets: ['GTEx'], size: 1320 },
        { sets: ['HPA'], size: 1170 },
        { sets: ['MANE'], size: 1660 },
        { sets: ['NCBI'], size: 1285 },
        { sets: ['Allen', 'GTEx'], size: 810 },
        { sets: ['Allen', 'HPA'], size: 694 },
        { sets: ['GTEx', 'HPA'], size: 676 },
        { sets: ['MANE', 'NCBI'], size: 902 },
        { sets: ['Allen', 'GTEx', 'MANE'], size: 552 },
        { sets: ['Allen', 'GTEx', 'HPA', 'MANE', 'NCBI'], size: 399 }
      ],
      venn: [
        { sets: ['Allen'], size: 1450 },
        { sets: ['GTEx'], size: 1320 },
        { sets: ['HPA'], size: 1170 },
        { sets: ['Allen', 'GTEx'], size: 810 },
        { sets: ['Allen', 'HPA'], size: 694 },
        { sets: ['GTEx', 'HPA'], size: 676 },
        { sets: ['Allen', 'GTEx', 'HPA'], size: 552 }
      ]
    }
  }
}
