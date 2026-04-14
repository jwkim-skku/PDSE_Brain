import { useEffect, useMemo, useState } from 'react'
import { Divider, Layout, Space, Tag, Typography } from 'antd'
import { BrainScene } from './components/BrainScene'
import { ControlPanel } from './components/ControlPanel'
import { ExpressionTable } from './components/ExpressionTable'
import { RegionInfoPanel } from './components/RegionInfoPanel'
import { SetVisualizations } from './components/SetVisualizations'
import { fetchExpressionData, fetchSetData } from './lib/api'
import './App.css'

const { Header, Sider, Content } = Layout

function App() {
  const [filters, setFilters] = useState({
    gene: '',
    databases: ['Allen', 'GTEx', 'HPA', 'MANE', 'NCBI'],
    aminoAcid: 'Glycine',
    batchSize: 50,
    highlightMode: true
  })
  const [records, setRecords] = useState([])
  const [sets, setSets] = useState([])
  const [vennData, setVennData] = useState([])
  const [selectedRegion, setSelectedRegion] = useState('Frontal lobe')
  const [hasModelAsset, setHasModelAsset] = useState(true)

  useEffect(() => {
    const run = async () => {
      const [expression, setResult] = await Promise.all([
        fetchExpressionData(filters),
        fetchSetData(filters)
      ])
      setRecords(expression.records ?? [])
      setSets(setResult.sets ?? [])
      setVennData(setResult.venn ?? [])
    }

    run()
  }, [filters])

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

  const subtitle = useMemo(() => {
    const dbLabel = filters.databases.join(', ')
    return `Gene: ${filters.gene || 'N/A'} | DB: ${dbLabel} | Batch: ${filters.batchSize}`
  }, [filters])

  const selectedRegionRecord = useMemo(
    () => records.find((record) => record.region === selectedRegion),
    [records, selectedRegion]
  )

  return (
    <Layout className="page-root">
      <Header className="brain-header">
        <Typography.Title level={2} className="title">
          3D Brain Clone Workspace
        </Typography.Title>
        <Typography.Text className="subtitle">{subtitle}</Typography.Text>
      </Header>

      <Layout>
        <Sider width={360} theme="light" className="left-panel">
          <ControlPanel
            filters={filters}
            onChange={(next) => setFilters((current) => ({ ...current, ...next }))}
          />

          <Divider />
          {!hasModelAsset && (
            <Typography.Text type="warning">
              public/models/brain_regions.glb 파일이 없어 임시 뷰로 동작 중입니다.
            </Typography.Text>
          )}
          <Space wrap>
            {filters.databases.map((db) => (
              <Tag key={db} color="blue">
                {db}
              </Tag>
            ))}
          </Space>
        </Sider>

        <Content className="content-panel">
          <div className="brain-viewport" aria-label="3D brain viewport">
            <BrainScene
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              highlightMode={filters.highlightMode}
            />
            <div className="overlay-card">
              <Typography.Title level={4}>3D Brain Viewport</Typography.Title>
              <Typography.Paragraph>
                클릭으로 영역을 선택할 수 있습니다. 현재 선택된 영역은 <b>{selectedRegion}</b> 입니다.
              </Typography.Paragraph>
            </div>
          </div>

          <RegionInfoPanel selectedRegion={selectedRegion} regionRecord={selectedRegionRecord} />
          <SetVisualizations sets={sets} vennData={vennData} />
          <ExpressionTable
            records={records}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
          />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
