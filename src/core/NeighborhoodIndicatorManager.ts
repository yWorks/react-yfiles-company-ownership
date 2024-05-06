import {
  AdjacencyTypes,
  Arrow,
  Class,
  GraphComponent,
  GraphHighlightIndicatorManager,
  IContextLookupChainLink,
  ILookupDecorator,
  IModelItem,
  IndicatorEdgeStyleDecorator,
  IndicatorNodeStyleDecorator,
  INode,
  Neighborhood,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  TraversalDirection
} from 'yfiles'
import { neighborhoodHighlightColor } from './defaults.ts'
import { HighlightOptions } from '../CompanyOwnership.tsx'

export class NeighborhoodIndicatorManager extends GraphHighlightIndicatorManager {
  // remember the neighborhood's items to restore the highlighting after collapse/expand
  private neighborhoodCollection: Set<IModelItem> = new Set<IModelItem>()

  constructor(
    private readonly graphComponent: GraphComponent,
    highlightOptions?: HighlightOptions
  ) {
    super({
      canvasComponent: graphComponent
    })
    this.update(highlightOptions)
  }

  update(highlightOptions?: HighlightOptions) {
    const neighborhoodColor =
      highlightOptions?.neighborhoodHighlightColor ?? neighborhoodHighlightColor
    const neighborhoodClass = highlightOptions?.neighborhoodHighlightCssClass ?? ''

    this.nodeStyle = new IndicatorNodeStyleDecorator({
      wrapped: new ShapeNodeStyle({
        shape: 'round-rectangle',
        stroke: `3px ${neighborhoodColor}`,
        fill: 'none',
        cssClass: neighborhoodClass
      }),
      // the padding from the actual node to its highlight visualization
      padding: 2
    })

    this.edgeStyle = new IndicatorEdgeStyleDecorator({
      wrapped: new PolylineEdgeStyle({
        targetArrow: new Arrow({
          type: 'triangle',
          stroke: `2px ${neighborhoodColor}`,
          fill: neighborhoodColor
        }),
        stroke: `3px ${neighborhoodColor}`,
        cssClass: neighborhoodClass
      })
    })
  }

  highlightNeighborhood(viewStartNode: INode): void {
    const graph = this.graphComponent.graph

    super.clearHighlights()

    this.addHighlight(viewStartNode)

    const neighborhood = new Neighborhood({
      startNodes: [viewStartNode],
      traversalDirection: TraversalDirection.BOTH
    })

    const result = neighborhood.run(graph)
    for (const node of result.neighbors) {
      const highlightItem = node
      if (highlightItem) {
        this.addHighlight(highlightItem)
      }

      for (const adjacentOutEdge of graph.edgesAt(node, AdjacencyTypes.OUTGOING)) {
        if (
          result.neighbors.includes(adjacentOutEdge.targetNode!) ||
          adjacentOutEdge.targetNode! === viewStartNode
        ) {
          const viewItem = adjacentOutEdge
          if (viewItem) {
            this.addHighlight(viewItem)
          }
        }
      }
      for (const adjacentInEdge of graph.edgesAt(node, AdjacencyTypes.INCOMING)) {
        if (
          result.neighbors.includes(adjacentInEdge.sourceNode!) ||
          adjacentInEdge.sourceNode === viewStartNode
        ) {
          const viewItem = adjacentInEdge
          if (viewItem) {
            this.addHighlight(viewItem)
          }
        }
      }
    }
  }

  addHighlight(item: IModelItem) {
    super.addHighlight(item)
    this.neighborhoodCollection.add(item)
  }

  clearHighlights() {
    this.neighborhoodCollection.clear()
    super.clearHighlights()
  }

  deactivateHighlights(): void {
    // clear highlights while keeping the internal collections
    super.clearHighlights()
  }

  activateHighlights(): void {
    for (const item of this.neighborhoodCollection) {
      super.addHighlight(item)
    }
  }
}

/**
 * Add the neighborhood highlight indicator manager to the lookup of the GraphComponent to obtain it when needed
 */
export function registerNeighborHoodIndicatorManager(
  graphComponent: GraphComponent,
  highlightOptions?: HighlightOptions
): void {
  Class.fixType(NeighborhoodIndicatorManager)

  const neighborhoodIndicatorManager = new NeighborhoodIndicatorManager(
    graphComponent,
    highlightOptions
  )
  const decorator = graphComponent.lookup(ILookupDecorator.$class) as ILookupDecorator
  decorator.addLookup(
    GraphComponent.$class,
    IContextLookupChainLink.createContextLookupChainLink((_item, type) => {
      if (type === NeighborhoodIndicatorManager.$class) {
        return neighborhoodIndicatorManager
      }
      return null
    })
  )
}

export function getNeighborhoodIndicatorManager(
  graphComponent: GraphComponent
): NeighborhoodIndicatorManager {
  const manager = graphComponent.lookup(NeighborhoodIndicatorManager.$class)
  if (!manager) {
    throw new Error('No NeighborhoodIndicatorManager registered on the GraphComponent')
  }
  return manager as NeighborhoodIndicatorManager
}
