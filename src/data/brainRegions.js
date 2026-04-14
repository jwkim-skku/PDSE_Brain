export const BRAIN_REGIONS = [
  {
    key: 'Frontal lobe',
    description: '의사결정, 실행 기능, 운동 계획과 관련된 영역입니다.',
    aliases: ['frontal', 'frontal_lobe', 'frontal-lobe']
  },
  {
    key: 'Temporal lobe',
    description: '청각 처리, 언어 이해, 기억 형성과 관련된 영역입니다.',
    aliases: ['temporal', 'temporal_lobe', 'temporal-lobe']
  },
  {
    key: 'Parietal lobe',
    description: '감각 통합, 공간 인지, 주의 전환과 관련된 영역입니다.',
    aliases: ['parietal', 'parietal_lobe', 'parietal-lobe']
  },
  {
    key: 'Occipital lobe',
    description: '시각 정보 처리의 핵심 영역입니다.',
    aliases: ['occipital', 'occipital_lobe', 'occipital-lobe']
  },
  {
    key: 'Cerebellum',
    description: '운동 조절, 균형, 타이밍 정밀도와 관련된 영역입니다.',
    aliases: ['cerebellum', 'cerebellar']
  }
]

export function mapNodeNameToRegion(nodeName) {
  const normalized = String(nodeName || '').toLowerCase()
  const matched = BRAIN_REGIONS.find((region) =>
    region.aliases.some((alias) => normalized.includes(alias))
  )
  return matched?.key ?? null
}
