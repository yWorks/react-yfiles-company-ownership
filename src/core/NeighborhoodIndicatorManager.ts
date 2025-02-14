import {
  AdjacencyTypes,
  Arrow,
  EdgeStyleIndicatorRenderer,
  GraphComponent,
  HighlightIndicatorManager,
  IEdge,
  IEdgeStyle,
  ILookupDecorator,
  IModelItem,
  INode,
  INodeStyle,
  IObjectRenderer,
  LookupDecorator,
  Neighborhood,
  NodeStyleIndicatorRenderer,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  TraversalDirection
} from '@yfiles/yfiles'
import { HighlightOptions } from '../CompanyOwnership.tsx'
import { neighborhoodHighlightColor } from './defaults.ts'

export class NeighborhoodIndicatorManager extends HighlightIndicatorManager<any> {
  // remember the neighborhood's master items to restore the highlighting after collapse/expand
  private neighborhoodCollection: Set<IModelItem> = new Set<IModelItem>()
  private nodeStyle: INodeStyle = INodeStyle.VOID_NODE_STYLE
  private edgeStyle: IEdgeStyle = IEdgeStyle.VOID_EDGE_STYLE

  constructor(graphComponent: GraphComponent, highlightOptions?: HighlightOptions) {
    super()
    this.canvasComponent = graphComponent
    this.update(highlightOptions)
  }

  update(highlightOptions?: HighlightOptions) {
    const neighborhoodColor =
      highlightOptions?.neighborhoodHighlightColor ?? neighborhoodHighlightColor
    const neighborhoodClass = highlightOptions?.neighborhoodHighlightCssClass ?? ''

    this.nodeStyle = new ShapeNodeStyle({
      shape: 'round-rectangle',
      stroke: `3px ${neighborhoodColor}`,
      fill: 'none',
      cssClass: neighborhoodClass
    })

    this.edgeStyle = new PolylineEdgeStyle({
      targetArrow: new Arrow({
        type: 'triangle',
        stroke: `2px ${neighborhoodColor}`,
        fill: neighborhoodColor
      }),
      stroke: `3px ${neighborhoodColor}`,
      cssClass: neighborhoodClass
    })
  }

  protected getRenderer(item: any): IObjectRenderer<any> | null {
    return item instanceof INode
      ? new NodeStyleIndicatorRenderer({
          nodeStyle: this.nodeStyle,
          // the padding from the actual node to its highlight visualization
          margins: 2
        })
      : item instanceof IEdge
        ? new EdgeStyleIndicatorRenderer({
            edgeStyle: this.edgeStyle,
            zoomPolicy: 'world-coordinates'
          })
        : super.getRenderer(item)
  }

  highlightNeighborhood(viewStartNode: INode): void {
    super.items?.clear()

    const graph = (this.canvasComponent as GraphComponent).graph
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

  addHighlight(viewItem: IModelItem) {
    super.items?.add(viewItem)
    this.neighborhoodCollection.add(viewItem)
  }

  clearHighlights() {
    this.neighborhoodCollection.clear()
    super.items?.clear()
  }

  deactivateHighlights(): void {
    // clear highlights while keeping the internal collections
    super.items?.clear()
  }

  activateHighlights(): void {
    // find the visible nodes in the graph depending on the stored collection
    let visibleItem: IModelItem | null = null
    for (const item of this.neighborhoodCollection) {
      if (item instanceof INode) {
        visibleItem = item
      } else if (item instanceof IEdge) {
        visibleItem = item
      }
      if (visibleItem) {
        super.items?.add(visibleItem)
      }
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
  const neighborhoodIndicatorManager = new NeighborhoodIndicatorManager(
    graphComponent,
    highlightOptions
  )
  const lookupDecorator = graphComponent.lookup(ILookupDecorator) as ILookupDecorator

  new LookupDecorator(GraphComponent, NeighborhoodIndicatorManager, lookupDecorator).addConstant(
    neighborhoodIndicatorManager
  )
}

export function getNeighborhoodIndicatorManager(
  graphComponent: GraphComponent
): NeighborhoodIndicatorManager {
  const manager = graphComponent.lookup(NeighborhoodIndicatorManager)
  if (!manager) {
    throw new Error('No NeighborhoodIndicatorManager registered on the GraphComponent')
  }
  return manager as NeighborhoodIndicatorManager
}
