import { useEffect, useMemo, useState } from 'react'
import { Card, Divider, Layout, List, Switch, Typography } from 'antd'
import { BrainScene } from './components/BrainScene'
import { LayerControl } from './components/LayerControl'
import { RegionInfoPanel } from './components/RegionInfoPanel'
import { RegionSearch } from './components/RegionSearch'
import { RegionTree } from './components/RegionTree'
import { fetchRegions } from './lib/api'
import { getRootRegions } from './lib/regionTree'
import './App.css'

const { Header, Sider, Content } = Layout

function App() {
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [highlightMode, setHighlightMode] = useState(true)
  const [layerSettings, setLayerSettings] = useState({})
  const [hasModelAsset, setHasModelAsset] = useState(true)
  const [meshDebug, setMeshDebug] = useState({
    source: 'unknown',
    totalMeshes: 0,
    recognizedMeshes: [],
    unmappedMeshes: []
  })

  useEffect(() => {
    let cancelled = false
    fetchRegions().then((rows) => {
      if (cancelled) return
      setRegions(rows)
      if (rows.length > 0) {
        setSelectedRegion((current) => current ?? rows[0].id)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Seed layerSettings with one entry per top-level region so the 3D scene
  // has a deterministic state for every subtree. New roots added later just
  // fall back to the default (visible, full opacity).
  useEffect(() => {
    const roots = getRootRegions(regions)
    if (roots.length === 0) return
    setLayerSettings((prev) => {
      const next = { ...prev }
      let changed = false
      roots.forEach((region) => {
        if (!next[region.id]) {
          next[region.id] = { opacity: 1, visible: true }
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [regions])

  useEffect(() => {
    let cancelled = false
    fetch('/models/brain_regions.glb', { method: 'HEAD' })
      .then((response) => {
        if (!cancelled) {
          setHasModelAsset(response.ok)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasModelAsset(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const selectedRegionData = useMemo(
    () => regions.find((region) => region.id === selectedRegion) ?? null,
    [regions, selectedRegion]
  )

  return (
    <Layout className="page-root">
      <Header className="brain-header">
        <Typography.Title level={2} className="title">
          3D Brain Clone Workspace
        </Typography.Title>
        <Typography.Text className="subtitle">
          선택 영역: {selectedRegionData?.name_en || '없음'}
        </Typography.Text>
      </Header>

      <Layout>
        <Sider width={360} theme="light" className="left-panel">
          <Card title="검색" size="small" className="panel-card">
            <RegionSearch onSelectRegion={setSelectedRegion} />
          </Card>

          <Divider />

          <Card title="영역 목록" size="small" className="panel-card">
            {regions.length === 0 ? (
              <Typography.Text type="secondary">영역을 불러오는 중...</Typography.Text>
            ) : (
              <RegionTree
                regions={regions}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
              />
            )}
          </Card>

          <Divider />

          <Card title="레이어" size="small" className="panel-card">
            <LayerControl
              regions={regions}
              layerSettings={layerSettings}
              onChange={setLayerSettings}
            />
          </Card>

          <Divider />

          <Card title="표시 옵션" size="small" className="panel-card">
            <Typography.Text>3D 강조 모드</Typography.Text>
            <Switch
              checked={highlightMode}
              onChange={setHighlightMode}
              style={{ marginLeft: 12 }}
            />
          </Card>

          <Divider />
          {!hasModelAsset && (
            <Typography.Text type="warning">
              public/models/brain_regions.glb 파일이 없어 임시 뷰로 동작 중입니다.
            </Typography.Text>
          )}

          <Divider />
          <Card title="Mesh 매핑 디버그" size="small" className="panel-card mesh-debug-card">
            <Typography.Text>
              source: <b>{meshDebug.source}</b>
            </Typography.Text>
            <br />
            <Typography.Text>
              mapped: <b>{meshDebug.recognizedMeshes.length}</b> / total: <b>{meshDebug.totalMeshes}</b>
            </Typography.Text>

            <List
              size="small"
              className="mesh-list"
              header="인식된 mesh -> region"
              dataSource={meshDebug.recognizedMeshes}
              locale={{ emptyText: '인식된 mesh 없음' }}
              renderItem={(item) => (
                <List.Item>
                  <Typography.Text code>{item.meshName}</Typography.Text> {'->'} {item.region}
                </List.Item>
              )}
            />
          </Card>
        </Sider>

        <Content className="content-panel">
          <div className="brain-viewport" aria-label="3D brain viewport">
            <BrainScene
              regions={regions}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              highlightMode={highlightMode}
              layerSettings={layerSettings}
              onMeshDebugChange={setMeshDebug}
            />
            <div className="overlay-card">
              <Typography.Title level={4}>3D Brain Viewport</Typography.Title>
              <Typography.Paragraph>
                클릭으로 영역을 선택할 수 있습니다. 현재 선택된 영역은{' '}
                <b>{selectedRegionData?.name_en || '없음'}</b> 입니다.
              </Typography.Paragraph>
            </div>
          </div>

          <RegionInfoPanel
            region={selectedRegionData}
            regions={regions}
            onSelectRegion={setSelectedRegion}
          />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
