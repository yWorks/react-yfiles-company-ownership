import type { IEdge, INode } from 'yfiles'
import { Entity, Connection } from '../CompanyOwnership.tsx'

/**
 * Type of data associated with a node.
 * It contains information that is used for the node visualization and interaction with the graph.
 */
export type CompanyNodeData = Entity & {
  invisible: boolean
  inputCollapsed: boolean
  outputCollapsed: boolean
}

/**
 * Type of data associated with an edge.
 * It contains information that is used for the edge visualization and layout.
 */
export type CompanyRelationshipData = Connection & {
  ownership: number
  isDominantHierarchyEdge: boolean
}

/**
 * Returns the data stored in the node's tag.
 */
export function getCompany(node: INode): CompanyNodeData {
  return node.tag as CompanyNodeData
}

/**
 * Returns the data stored in the edge's tag.
 */
export function getRelationship(edge: IEdge): CompanyRelationshipData {
  return edge.tag as CompanyRelationshipData
}
