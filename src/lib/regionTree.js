// Convert a flat list of { id, name_en, name_ko, parent_id, ... } regions
// into AntD Tree `treeData` (nested { key, title, region, children }).
// Orphans (parent_id that doesn't resolve) are promoted to the root so the
// UI still surfaces them instead of silently dropping entries.
export function buildTreeData(regions) {
  if (!Array.isArray(regions) || regions.length === 0) return []

  const byId = new Map()
  regions.forEach((region) => {
    byId.set(region.id, { key: region.id, title: '', region, children: [] })
  })

  const roots = []
  regions.forEach((region) => {
    const node = byId.get(region.id)
    const parent = region.parent_id ? byId.get(region.parent_id) : null
    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

// Walk up parent_id chain for a given region id. Returns ancestor ids in
// root-to-leaf order so callers can feed them directly into AntD's
// expandedKeys (which expects every ancestor of an expanded node).
export function getAncestorIds(regions, id) {
  if (!id || !Array.isArray(regions)) return []
  const byId = new Map(regions.map((region) => [region.id, region]))

  const chain = []
  let current = byId.get(id)
  let guard = 0
  while (current && current.parent_id && guard < 32) {
    chain.push(current.parent_id)
    current = byId.get(current.parent_id)
    guard += 1
  }
  return chain.reverse()
}
