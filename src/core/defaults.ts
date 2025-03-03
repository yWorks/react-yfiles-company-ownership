import { LayoutOptions } from '../CompanyOwnership.tsx'
import { Arrow, ArrowType, Insets, PolylineEdgeStyle, PortAdjustmentPolicy } from '@yfiles/yfiles'

export const componentBackgroundColor = 'rgb(238,238,238)'
export const maximumZoom = 4
export const minimumZoom = 0

export const defaultLayoutOptions: LayoutOptions = {
  direction: 'top-to-bottom',
  routingStyle: 'orthogonal',
  minimumLayerDistance: 100,
  minimumFirstSegmentLength: 50,
  minimumLastSegmentLength: 50
}

export const defaultGraphFitInsets = new Insets(100)

export const defaultOwnershipEdgeColor = '#1a3442'

export const defaultRelationEdgeColor = '#f21919'

export const defaultEdgeWidth = '2px'

export const defaultOwnershipEdgeSmoothingLength = 5

export const defaultRelationEdgeSmoothingLength = 100

export const defaultOwnershipEdgeStyle = new PolylineEdgeStyle({
  targetArrow: new Arrow({
    type: ArrowType.TRIANGLE,
    stroke: defaultOwnershipEdgeColor,
    fill: defaultOwnershipEdgeColor
  }),
  sourceArrow: new Arrow(ArrowType.NONE),
  stroke: `${defaultEdgeWidth} ${defaultOwnershipEdgeColor}`,
  smoothingLength: defaultOwnershipEdgeSmoothingLength,
  cssClass: 'yfiles-react-ownership-connection'
})
export const defaultRelationEdgeStyle = new PolylineEdgeStyle({
  targetArrow: new Arrow({
    type: ArrowType.TRIANGLE,
    stroke: defaultRelationEdgeColor,
    fill: defaultRelationEdgeColor
  }),
  sourceArrow: new Arrow(ArrowType.NONE),
  stroke: `${defaultEdgeWidth} dashed ${defaultRelationEdgeColor}`,
  smoothingLength: defaultRelationEdgeSmoothingLength,
  cssClass: 'yfiles-react-relation-connection'
})
export const defaultExportMargins = { top: 5, right: 5, left: 5, bottom: 5 }

export const neighborhoodHighlightColor = '#30cc00'

// Draw the edges all the way to the borders of the shapes.
export const defaultPortAdjustmentPolicy = PortAdjustmentPolicy.ALWAYS

export const hoverHighlightColor = '#FF6F00'
export const selectionHighlightColor = '#4cc7ff'
