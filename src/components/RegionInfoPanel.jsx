import { useMemo } from 'react'
import { Card, Descriptions, Empty, List, Tabs, Tag, Typography } from 'antd'

function RelatedAnatomy({ region, regions, onSelectRegion }) {
  const byId = useMemo(() => new Map(regions.map((r) => [r.id, r])), [regions])

  const parent = region.parent_id ? byId.get(region.parent_id) : null
  const children = regions.filter((r) => r.parent_id === region.id)
  const siblings = region.parent_id
    ? regions.filter((r) => r.parent_id === region.parent_id && r.id !== region.id)
    : []

  const Chip = ({ target }) => (
    <Tag
      key={target.id}
      color="blue"
      style={{ cursor: 'pointer' }}
      onClick={() => onSelectRegion?.(target.id)}
    >
      {target.name_en}
      {target.name_ko ? ` (${target.name_ko})` : ''}
    </Tag>
  )

  const hasAny = parent || children.length > 0 || siblings.length > 0
  if (!hasAny) {
    return <Empty description="연결된 해부학 정보 없음" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <div>
      {parent && (
        <div style={{ marginBottom: 8 }}>
          <Typography.Text strong>상위: </Typography.Text>
          <Chip target={parent} />
        </div>
      )}
      {children.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <Typography.Text strong>하위 영역: </Typography.Text>
          {children.map((c) => <Chip key={c.id} target={c} />)}
        </div>
      )}
      {siblings.length > 0 && (
        <div>
          <Typography.Text strong>같은 수준: </Typography.Text>
          {siblings.map((s) => <Chip key={s.id} target={s} />)}
        </div>
      )}
    </div>
  )
}

export function RegionInfoPanel({ region, regions = [], onSelectRegion }) {
  if (!region) {
    return (
      <Card title="선택 영역 상세 정보" size="small" className="panel-card">
        <Typography.Text type="secondary">영역을 선택하면 정보가 표시됩니다.</Typography.Text>
      </Card>
    )
  }

  const tabs = [
    {
      key: 'overview',
      label: '개요',
      children: (
        <>
          <Typography.Paragraph>
            {region.description || '설명이 아직 등록되지 않았습니다.'}
          </Typography.Paragraph>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="ID">{region.id}</Descriptions.Item>
            {region.parent_id && (
              <Descriptions.Item label="Parent">{region.parent_id}</Descriptions.Item>
            )}
            {region.mesh_name && (
              <Descriptions.Item label="Mesh">{region.mesh_name}</Descriptions.Item>
            )}
          </Descriptions>
        </>
      )
    },
    {
      key: 'functions',
      label: `기능 (${region.functions?.length || 0})`,
      children:
        region.functions?.length > 0 ? (
          <List
            size="small"
            dataSource={region.functions}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        ) : (
          <Empty description="등록된 기능 없음" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )
    },
    {
      key: 'disorders',
      label: `관련 질환 (${region.disorders?.length || 0})`,
      children:
        region.disorders?.length > 0 ? (
          <div>
            {region.disorders.map((d) => (
              <Tag key={d} color="red" style={{ margin: 4 }}>
                {d}
              </Tag>
            ))}
          </div>
        ) : (
          <Empty description="등록된 질환 정보 없음" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )
    },
    {
      key: 'related',
      label: '연결 해부학',
      children: (
        <RelatedAnatomy region={region} regions={regions} onSelectRegion={onSelectRegion} />
      )
    }
  ]

  return (
    <Card size="small" className="panel-card">
      <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
        {region.name_en}
        {region.name_ko ? ` (${region.name_ko})` : ''}
      </Typography.Title>
      <Tabs size="small" items={tabs} />
    </Card>
  )
}
