import { Card, Descriptions, Tag, Typography } from 'antd'

export function RegionInfoPanel({ region }) {
  if (!region) {
    return (
      <Card title="선택 영역 상세 정보" size="small" className="panel-card">
        <Typography.Text type="secondary">영역을 선택하면 정보가 표시됩니다.</Typography.Text>
      </Card>
    )
  }

  return (
    <Card title="선택 영역 상세 정보" size="small" className="panel-card">
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        {region.name_en}
        {region.name_ko ? ` (${region.name_ko})` : ''}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        {region.description || '설명이 아직 등록되지 않았습니다.'}
      </Typography.Paragraph>

      {region.functions?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Typography.Text strong>기능: </Typography.Text>
          {region.functions.map((f) => (
            <Tag key={f} color="blue">{f}</Tag>
          ))}
        </div>
      )}

      {region.disorders?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Typography.Text strong>관련 질환: </Typography.Text>
          {region.disorders.map((d) => (
            <Tag key={d} color="red">{d}</Tag>
          ))}
        </div>
      )}

      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="ID">{region.id}</Descriptions.Item>
        {region.parent_id && (
          <Descriptions.Item label="Parent">{region.parent_id}</Descriptions.Item>
        )}
        {region.mesh_name && (
          <Descriptions.Item label="Mesh">{region.mesh_name}</Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  )
}
