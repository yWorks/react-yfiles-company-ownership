import {
  type GraphComponent,
  GraphFocusIndicatorManager,
  GraphItemTypes,
  GraphViewerInputMode,
  HoveredItemChangedEventArgs,
  IEdge,
  INode,
  ItemHoverInputMode,
  ShowFocusPolicy,
  VoidNodeStyle
} from 'yfiles'
import { geTEntity } from './data-loading'
import { CompanyOwnershipModel } from '../CompanyOwnershipModel.ts'
import { Connection, Entity } from '../CompanyOwnership.tsx'
import { initializeHoverHighlighting } from './configure-highlight-indicators.ts'

/**
 * Set up the graph viewer input mode to and enables interactivity to expand and collapse subtrees.
 */
export function initializeInputMode(
  graphComponent: GraphComponent,
  CompanyOwnership: CompanyOwnershipModel,
): void {
  const graphViewerInputMode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    marqueeSelectableItems: GraphItemTypes.NONE,
    toolTipItems: GraphItemTypes.NONE,
    contextMenuItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    focusableItems: GraphItemTypes.NODE,
    clickHitTestOrder: [GraphItemTypes.EDGE, GraphItemTypes.NODE]
  })

  graphViewerInputMode.addItemDoubleClickedListener((_, evt) => {
    const item = evt.item
    if (item instanceof INode) {
      CompanyOwnership.zoomTo([geTEntity(item) as Entity])
      evt.handled = true
    }
  })

  initializeHoverHighlighting(graphComponent, graphViewerInputMode)

  graphComponent.inputMode = graphViewerInputMode
}

export function initializeHover<TEntity extends Entity | Connection>(
  onHover: ((item: TEntity | null, oldItem?: TEntity | null) => void) | undefined,
  graphComponent: GraphComponent
) {
  const inputMode = graphComponent.inputMode as GraphViewerInputMode
  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE
  // Do not report "null" for ignored hovered items.
  inputMode.itemHoverInputMode.discardInvalidItems = false

  const hoverItemChangedListener: (
    sender: ItemHoverInputMode,
    evt: HoveredItemChangedEventArgs
  ) => void = (_, { item, oldItem }): void => {
    if (onHover) {
      onHover(item?.tag, oldItem?.tag)
    }
  }

  inputMode.itemHoverInputMode.addHoveredItemChangedListener(hoverItemChangedListener)
  return hoverItemChangedListener
}

/**
 * Adds and returns the listener when the currentItem changes. The return is needed so that the listener
 * can be removed from the graph.
 */
export function initializeFocus<TEntity extends Entity | Connection>(
  onFocus: ((item: TEntity | null) => void) | undefined,
  graphComponent: GraphComponent
) {
  let currentItemChangedListener = () => {}
  if (onFocus) {
    // display information about the current item
    currentItemChangedListener = () => {
      const currentItem = graphComponent.currentItem
      if (currentItem instanceof INode) {
        onFocus(geTEntity<TEntity>(currentItem))
      } else {
        onFocus(null)
      }
    }
  }
  graphComponent.addCurrentItemChangedListener(currentItemChangedListener)
  return currentItemChangedListener
}

/**
 * Adds and returns the listener when the selected item changes. The return is needed so that the listener
 * can be removed from the graph.
 */
export function initializeSelection<TEntity extends Entity | Connection>(
  onSelect: ((selectedItems: TEntity[]) => void) | undefined,
  graphComponent: GraphComponent
) {
  let itemSelectionChangedListener = () => {}
  if (onSelect) {
    // display information about the current item
    itemSelectionChangedListener = () => {
      onSelect(
        graphComponent.selection
          .filter(element => IEdge.isInstance(element) || INode.isInstance(element))
          .map(element => geTEntity<TEntity>(element as INode | IEdge))
          .toArray()
      )
    }
  }
  graphComponent.selection.addItemSelectionChangedListener(itemSelectionChangedListener)
  return itemSelectionChangedListener
}

/**
 * Initializes the highlights for selected or focused elements.
 */
export function initializeHighlights(graphComponent: GraphComponent): void {
  graphComponent.selectionIndicatorManager.enabled = false

  // Hide the default focus highlight in favor of the CSS highlighting from the template styles
  graphComponent.focusIndicatorManager = new GraphFocusIndicatorManager({
    showFocusPolicy: ShowFocusPolicy.ALWAYS,
    nodeStyle: VoidNodeStyle.INSTANCE
  })
}
