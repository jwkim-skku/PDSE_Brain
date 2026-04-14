// Map mesh node name (from GLB) to a region id.
// The `regions` argument is the list fetched from the backend; each entry
// carries its canonical `mesh_name`. A loose includes-match handles minor
// naming variations (underscores, case) between the exporter and the DB.
export function mapNodeNameToRegion(nodeName, regions) {
  const normalized = String(nodeName || '').toLowerCase()
  if (!normalized || !Array.isArray(regions)) return null
  const matched = regions.find((region) => {
    const mesh = String(region.mesh_name || '').toLowerCase()
    return mesh && normalized.includes(mesh)
  })
  return matched?.id ?? null
}
