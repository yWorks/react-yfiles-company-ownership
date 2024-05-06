import {
  Arrow,
  EdgeStyleDecorationInstaller,
  GraphComponent,
  GraphFocusIndicatorManager,
  GraphHighlightIndicatorManager,
  GraphSelectionIndicatorManager,
  GraphViewerInputMode,
  IEdge,
  IEdgeStyle,
  type IModelItem,
  IndicatorNodeStyleDecorator,
  INodeStyle,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  VoidEdgeStyle,
  VoidNodeStyle
} from 'yfiles'
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
  highlightManager.clearHighlights()
  if (item) {
    if (highlight) {
      highlightManager.addHighlight(item)
    } else {
      highlightManager.removeHighlight(item)
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
  inputMode.itemHoverInputMode.addHoveredItemChangedListener((_, { item, oldItem }) => {
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
  graphComponent.highlightIndicatorManager = new GraphHighlightIndicatorManager({
    nodeStyle: new IndicatorNodeStyleDecorator({
      wrapped: getHighlightNodeStyle(hoverColor, hoverClass),
      // the padding from the actual node to its highlight visualization
      padding: 4,
      zoomPolicy: 'mixed'
    })
  })

  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    nodeStyle: new IndicatorNodeStyleDecorator({
      wrapped: getHighlightNodeStyle(selectionColor, selectionClass),
      // the padding from the actual node to its highlight visualization
      padding: 4,
      zoomPolicy: 'mixed'
    })
  })

  const graphDecorator = graphComponent.graph.decorator
  graphDecorator.edgeDecorator.selectionDecorator.setFactory(edge => {
    return new EdgeStyleDecorationInstaller({
      edgeStyle: getHighlightEdgeStyle(edge, selectionColor, selectionClass),
      zoomPolicy: 'mixed'
    })
  })
  graphDecorator.edgeDecorator.highlightDecorator.setFactory(edge => {
    return new EdgeStyleDecorationInstaller({
      edgeStyle: getHighlightEdgeStyle(edge, hoverColor, hoverClass),
      zoomPolicy: 'mixed'
    })
  })

  // hide focus indication
  graphComponent.focusIndicatorManager = new GraphFocusIndicatorManager({
    nodeStyle: VoidNodeStyle.INSTANCE,
    edgeStyle: VoidEdgeStyle.INSTANCE
  })
}
