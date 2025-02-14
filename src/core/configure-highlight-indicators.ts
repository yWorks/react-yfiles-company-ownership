import {
  Arrow,
  EdgeStyleIndicatorRenderer,
  GraphComponent,
  GraphViewerInputMode,
  IEdge,
  IEdgeStyle,
  type IModelItem,
  INodeStyle,
  NodeStyleIndicatorRenderer,
  PolylineEdgeStyle,
  ShapeNodeStyle
} from '@yfiles/yfiles'
import { hoverHighlightColor, selectionHighlightColor } from './defaults.ts'
import { HighlightOptions } from '../CompanyOwnership.tsx'

/**
 * Adds or removes a CSS class to highlight the given item.
 */
async function highlightItem(
  graphComponent: GraphComponent,
  item: IModelItem | null,
  highlight: boolean
): Promise<void> {
  const highlightManager = graphComponent.highlightIndicatorManager
  highlightManager.items?.clear()
  if (item) {
    if (highlight) {
      highlightManager.items?.add(item)
    } else {
      highlightManager.items?.remove(item)
    }
  }
}

function getHighlightEdgeStyle(edge: IEdge, color: string, cssClass: string): IEdgeStyle {
  const edgeStyle = edge.style as PolylineEdgeStyle
  return new PolylineEdgeStyle({
    targetArrow: new Arrow({
      type: (edgeStyle.targetArrow as Arrow).type,
      stroke: `2px ${color}`,
      fill: color
    }),
    stroke: `3px ${color}`,
    smoothingLength: edgeStyle.smoothingLength,
    cssClass: cssClass
  })
}

function getHighlightNodeStyle(color: string, cssClass: string): INodeStyle {
  return new ShapeNodeStyle({
    shape: 'round-rectangle',
    stroke: `3px ${color}`,
    fill: 'none',
    cssClass: cssClass
  })
}

export function initializeHoverHighlighting(
  graphComponent: GraphComponent,
  inputMode: GraphViewerInputMode
) {
  // show the indicators on hover
  inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', ({ item, oldItem }) => {
    void highlightItem(graphComponent, oldItem, false)
    void highlightItem(graphComponent, item, true)
  })
}

export function configureIndicatorStyling(
  graphComponent: GraphComponent,
  highlightOptions?: HighlightOptions
) {
  const selectionColor = highlightOptions?.selectionHighlightColor ?? selectionHighlightColor
  const selectionClass = highlightOptions?.selectionHighlightCssClass ?? ''
  const hoverColor = highlightOptions?.hoverHighlightColor ?? hoverHighlightColor
  const hoverClass = highlightOptions?.hoverHighlightCssClass ?? ''

  // style the selection and hover indicators
  graphComponent.graph.decorator.nodes.highlightRenderer.addConstant(
    new NodeStyleIndicatorRenderer({
      nodeStyle: getHighlightNodeStyle(hoverColor, hoverClass),
      // the margin from the actual node to its highlight visualization
      margins: 4,
      zoomPolicy: 'mixed'
    })
  )

  graphComponent.graph.decorator.nodes.selectionRenderer.addConstant(
    new NodeStyleIndicatorRenderer({
      nodeStyle: getHighlightNodeStyle(selectionColor, selectionClass),
      // the margin from the actual node to its highlight visualization
      margins: 4,
      zoomPolicy: 'mixed'
    })
  )

  const graphDecorator = graphComponent.graph.decorator
  graphDecorator.edges.selectionRenderer.addFactory(edge => {
    return new EdgeStyleIndicatorRenderer({
      edgeStyle: getHighlightEdgeStyle(edge, selectionColor, selectionClass),
      zoomPolicy: 'mixed'
    })
  })
  graphDecorator.edges.highlightRenderer.addFactory(edge => {
    return new EdgeStyleIndicatorRenderer({
      edgeStyle: getHighlightEdgeStyle(edge, hoverColor, hoverClass),
      zoomPolicy: 'mixed'
    })
  })

  // hide focus indication
  graphComponent.graph.decorator.nodes.focusRenderer.hide()
  graphComponent.graph.decorator.edges.focusRenderer.hide()
}
