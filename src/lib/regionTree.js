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

// Return the top-level ancestor id for a region (the root of its subtree).
// Used to map every mesh to a "layer" (e.g. the lobe meshes under cerebrum
// all belong to the cerebrum layer). A region with no parent is its own root.
export function getRootId(regions, id) {
  if (!id || !Array.isArray(regions)) return null
  const byId = new Map(regions.map((region) => [region.id, region]))
  let current = byId.get(id)
  let guard = 0
  while (current && current.parent_id && guard < 32) {
    current = byId.get(current.parent_id)
    guard += 1
  }
  return current?.id ?? null
}

// Precompute a map of region id -> root id. Cheaper than calling getRootId
// for every mesh on each render.
export function buildRootMap(regions) {
  if (!Array.isArray(regions)) return new Map()
  const byId = new Map(regions.map((region) => [region.id, region]))
  const rootOf = new Map()
  for (const region of regions) {
    let current = region
    let guard = 0
    while (current && current.parent_id && guard < 32) {
      current = byId.get(current.parent_id)
      guard += 1
    }
    rootOf.set(region.id, current?.id ?? region.id)
  }
  return rootOf
}

// Top-level regions — the ones that act as layers.
export function getRootRegions(regions) {
  if (!Array.isArray(regions)) return []
  return regions.filter((region) => !region.parent_id)
}
