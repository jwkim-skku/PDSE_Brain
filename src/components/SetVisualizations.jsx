import { useEffect, useMemo, useRef } from 'react'
import { Card, Col, Row } from 'antd'
import { UpSetJS } from '@upsetjs/react'
import * as venn from '@upsetjs/venn.js'
import * as d3 from 'd3'

export function SetVisualizations({ sets, vennData }) {
  const vennRef = useRef(null)
  const upsetData = useMemo(() => sets ?? [], [sets])

  useEffect(() => {
    if (!vennRef.current || !vennData?.length) {
      return
    }

    vennRef.current.innerHTML = ''
    const chart = venn.VennDiagram().width(420).height(310)
    const container = d3.select(vennRef.current)
    container.datum(vennData).call(chart)
  }, [vennData])

  return (
    <Row gutter={16}>
      <Col span={14}>
        <Card title="UpSet (UpSetJS)" size="small" className="panel-card upset-card">
          <div className="upset-wrapper">
            <UpSetJS sets={upsetData} width={700} height={320} />
          </div>
        </Card>
      </Col>
      <Col span={10}>
        <Card title="Venn Diagram" size="small" className="panel-card">
          <div ref={vennRef} className="venn-wrapper" />
        </Card>
      </Col>
    </Row>
  )
}
