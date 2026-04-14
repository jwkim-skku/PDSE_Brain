import { useEffect, useMemo, useState } from 'react'
import { Card, Divider, Layout, List, Switch, Typography } from 'antd'
import { BrainScene } from './components/BrainScene'
import { RegionInfoPanel } from './components/RegionInfoPanel'
import { fetchRegions } from './lib/api'
import './App.css'

const { Header, Sider, Content } = Layout

function App() {
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [highlightMode, setHighlightMode] = useState(true)
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
          <Card title="영역 목록" size="small" className="panel-card">
            <List
              size="small"
              dataSource={regions}
              locale={{ emptyText: '영역을 불러오는 중...' }}
              renderItem={(region) => (
                <List.Item
                  onClick={() => setSelectedRegion(region.id)}
                  style={{
                    cursor: 'pointer',
                    background: region.id === selectedRegion ? '#e6f4ff' : 'transparent'
                  }}
                >
                  <Typography.Text strong>{region.name_en}</Typography.Text>
                  {region.name_ko && (
                    <Typography.Text type="secondary"> ({region.name_ko})</Typography.Text>
                  )}
                </List.Item>
              )}
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

          <RegionInfoPanel region={selectedRegionData} />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
