import { Slider, Space, Switch, Typography } from 'antd'
import { getRootRegions } from '../lib/regionTree'

// Per-layer (top-level region) visibility + opacity. Each top-level region
// controls its entire subtree: hiding cerebrum hides all four lobes too.
// layerSettings shape: { [rootId]: { opacity: 0..1, visible: bool } }
export function LayerControl({ regions, layerSettings, onChange }) {
  const roots = getRootRegions(regions)
  if (roots.length === 0) {
    return <Typography.Text type="secondary">레이어 정보 없음</Typography.Text>
  }

  const updateLayer = (rootId, patch) => {
    const current = layerSettings[rootId] ?? { opacity: 1, visible: true }
    onChange({ ...layerSettings, [rootId]: { ...current, ...patch } })
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {roots.map((region) => {
        const setting = layerSettings[region.id] ?? { opacity: 1, visible: true }
        return (
          <div key={region.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: region.color || '#888',
                    marginRight: 6
                  }}
                />
                <Typography.Text strong style={{ fontSize: 12 }}>
                  {region.name_en}
                </Typography.Text>
                {region.name_ko && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {' '}({region.name_ko})
                  </Typography.Text>
                )}
              </span>
              <Switch
                size="small"
                checked={setting.visible}
                onChange={(visible) => updateLayer(region.id, { visible })}
              />
            </div>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={setting.opacity}
              onChange={(opacity) => updateLayer(region.id, { opacity })}
              disabled={!setting.visible}
              tooltip={{ formatter: (v) => `${Math.round(v * 100)}%` }}
            />
          </div>
        )
      })}
    </Space>
  )
}
