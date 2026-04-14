import { Card, Table } from 'antd'

const columns = [
  { title: 'Brain Region', dataIndex: 'region', key: 'region' },
  { title: 'Allen', dataIndex: 'Allen', key: 'Allen' },
  { title: 'GTEx', dataIndex: 'GTEx', key: 'GTEx' },
  { title: 'HPA', dataIndex: 'HPA', key: 'HPA' },
  { title: 'MANE', dataIndex: 'MANE', key: 'MANE' },
  { title: 'NCBI', dataIndex: 'NCBI', key: 'NCBI' }
]

export function ExpressionTable({ records, selectedRegion, onSelectRegion }) {
  return (
    <Card title="영역별 발현 요약" size="small" className="panel-card">
      <Table
        rowKey="region"
        dataSource={records}
        columns={columns}
        onRow={(record) => ({
          onClick: () => onSelectRegion(record.region),
          className: record.region === selectedRegion ? 'selected-region-row' : ''
        })}
        size="small"
        pagination={false}
        scroll={{ x: 720 }}
      />
    </Card>
  )
}
