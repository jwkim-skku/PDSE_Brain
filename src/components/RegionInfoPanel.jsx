import { Card, Col, Descriptions, Row, Tag, Typography } from 'antd'
import { BRAIN_REGIONS } from '../data/brainRegions'

export function RegionInfoPanel({ selectedRegion, regionRecord }) {
  const info = BRAIN_REGIONS.find((region) => region.key === selectedRegion)

  return (
    <Card title="선택 영역 상세 정보" size="small" className="panel-card">
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        {selectedRegion}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        {info?.description ?? '해당 영역 설명이 없습니다.'}
      </Typography.Paragraph>

      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        {['Allen', 'GTEx', 'HPA', 'MANE', 'NCBI'].map((db) => (
          <Col key={db}>
            <Tag color="geekblue">
              {db}: {regionRecord?.[db] ?? 0}
            </Tag>
          </Col>
        ))}
      </Row>

      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="Region">{selectedRegion}</Descriptions.Item>
        <Descriptions.Item label="Allen">{regionRecord?.Allen ?? 0}</Descriptions.Item>
        <Descriptions.Item label="GTEx">{regionRecord?.GTEx ?? 0}</Descriptions.Item>
        <Descriptions.Item label="HPA">{regionRecord?.HPA ?? 0}</Descriptions.Item>
        <Descriptions.Item label="MANE">{regionRecord?.MANE ?? 0}</Descriptions.Item>
        <Descriptions.Item label="NCBI">{regionRecord?.NCBI ?? 0}</Descriptions.Item>
      </Descriptions>
    </Card>
  )
}
