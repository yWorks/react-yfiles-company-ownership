import { DefaultLabelStyle, type INodeStyle, InteriorLabelModel, LabelDefaults, Size } from 'yfiles'
import { CustomShapeNodeStyle } from './CustomShapeNodeStyle.ts'
import { Entity } from '../CompanyOwnership.tsx'

/**
 * Returns the style of a node based on its type.
 * @param item The given node
 */
export function getNodeStyle(item: Entity): INodeStyle {
  return new CustomShapeNodeStyle(item.type ?? 'Unknown')
}

// configures the style of the node labels
export const nodeLabelStyle = new DefaultLabelStyle({
  wrapping: 'word-ellipsis',
  horizontalTextAlignment: 'center',
  verticalTextAlignment: 'center'
})

// configures the node label parameter
export const nodeLabelParameter = InteriorLabelModel.CENTER

// configures the node label size (used for wrapping)
export const labelSizeDefaults = new Size(80, 60)

// sets some defaults for node labels
export const nameLabelDefaults = new LabelDefaults({
  style: nodeLabelStyle,
  layoutParameter: nodeLabelParameter,
  autoAdjustPreferredSize: false
})
