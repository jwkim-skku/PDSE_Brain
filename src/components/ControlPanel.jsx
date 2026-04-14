import { Card, Col, Form, Input, Row, Select, Slider, Switch, Typography } from 'antd'
import { aminoAcidList } from '../data/aminoAcidList'

const dbOptions = ['Allen', 'GTEx', 'HPA', 'MANE', 'NCBI'].map((value) => ({ value, label: value }))

export function ControlPanel({ filters, onChange }) {
  return (
    <Card title="검색/필터" size="small" className="panel-card">
      <Form layout="vertical">
        <Form.Item label="Gene symbol">
          <Input
            value={filters.gene}
            placeholder="예: APP, MAPT"
            onChange={(event) => onChange({ gene: event.target.value })}
          />
        </Form.Item>

        <Form.Item label="사용 데이터베이스">
          <Select
            mode="multiple"
            value={filters.databases}
            options={dbOptions}
            onChange={(databases) => onChange({ databases })}
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Amino acid">
              <Select
                value={filters.aminoAcid}
                options={aminoAcidList.map((value) => ({ value, label: value }))}
                onChange={(aminoAcid) => onChange({ aminoAcid })}
                showSearch
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="NCBI batch size">
              <Slider
                min={10}
                max={200}
                step={10}
                value={filters.batchSize}
                onChange={(batchSize) => onChange({ batchSize })}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="3D 강조 모드">
          <Switch checked={filters.highlightMode} onChange={(highlightMode) => onChange({ highlightMode })} />
        </Form.Item>

        <Typography.Text type="secondary">
          NCBI Entrez batch 기본값은 50으로 동작합니다.
        </Typography.Text>
      </Form>
    </Card>
  )
}
