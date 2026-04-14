import { useEffect, useMemo, useState } from 'react'
import { Tree, Typography } from 'antd'
import { buildTreeData, getAncestorIds } from '../lib/regionTree'

function renderTitle(node) {
  const { region } = node
  return (
    <span>
      <Typography.Text strong>{region.name_en}</Typography.Text>
      {region.name_ko && (
        <Typography.Text type="secondary"> ({region.name_ko})</Typography.Text>
      )}
    </span>
  )
}

export function RegionTree({ regions, selectedRegion, onSelectRegion }) {
  const treeData = useMemo(() => buildTreeData(regions), [regions])

  // expandedKeys is controlled so we can auto-expand ancestors when the
  // selection changes from outside (e.g. 3D viewport click). Defaults to
  // every root expanded so the top-level structure is visible on first paint.
  const [expandedKeys, setExpandedKeys] = useState([])

  useEffect(() => {
    if (treeData.length === 0) return
    setExpandedKeys((prev) => {
      const seed = new Set(prev)
      treeData.forEach((node) => seed.add(node.key))
      return Array.from(seed)
    })
  }, [treeData])

  useEffect(() => {
    if (!selectedRegion) return
    const ancestors = getAncestorIds(regions, selectedRegion)
    if (ancestors.length === 0) return
    setExpandedKeys((prev) => {
      const merged = new Set(prev)
      ancestors.forEach((id) => merged.add(id))
      return Array.from(merged)
    })
  }, [regions, selectedRegion])

  const selectedKeys = selectedRegion ? [selectedRegion] : []

  return (
    <Tree
      treeData={treeData}
      titleRender={renderTitle}
      selectedKeys={selectedKeys}
      expandedKeys={expandedKeys}
      onExpand={(keys) => setExpandedKeys(keys)}
      onSelect={(keys) => {
        // AntD toggles selection on second click of same node; keep the
        // selection sticky so the 3D view always reflects *some* region.
        if (keys.length > 0) {
          onSelectRegion(keys[0])
        }
      }}
      blockNode
      showLine
    />
  )
}
