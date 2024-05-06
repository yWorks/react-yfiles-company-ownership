import { Connection, Entity } from '../CompanyOwnership.tsx'
import { ContextMenuItem } from '@yworks/react-yfiles-core'
import { useCompanyOwnershipContext } from '../CompanyOwnershipProvider.tsx'

/**
 * Default [context menu items]{@link ContextMenuProps.menuItems} for the context menu component that include the
 * standard company ownership actions.
 *
 * ```tsx
 * function CompanyOwnership() {
 *   return (
 *     <CompanyOwnership data={data} contextMenuItems={DefaultContextMenuItems}></CompanyOwnership>
 *   )
 * }
 * ```
 *
 * @param item - The item to provide the items for.
 * @returns an array of [context menu items]{@link ContextMenuProps.menuItems}.
 */
export function DefaultContextMenuItems(
  item: Entity | Connection | null
): ContextMenuItem<Entity | Connection>[] {
  const {
    isConnection,
    highlightConnectedItems,
    showGenealogy,
    canClearConnectedItemsHighlight,
    clearConnectedItemsHighlight,
    canShowAll,
    showAll,
    canShowSuccessors,
    showSuccessors,
    canHideSuccessors,
    hideSuccessors,
    canShowPredecessors,
    showPredecessors,
    canHidePredecessors,
    hidePredecessors
  } = useCompanyOwnershipContext()

  const menuItems: ContextMenuItem<Entity | Connection>[] = []
  if (item) {
    const isEdge = isConnection(item)

    if (!isEdge) {
      menuItems.push({
        title: 'Highlight Visible Connected Entities',
        action: () => {
          highlightConnectedItems(item)
        }
      })

      menuItems.push({
        title: 'Filter Company Genealogy',
        action: () => {
          showGenealogy(item)
        }
      })

      if (canShowSuccessors(item)) {
        menuItems.push({
          title: 'Show Successors',
          action: () => {
            void showSuccessors(item)
          }
        })
      }

      if (canHideSuccessors(item)) {
        menuItems.push({
          title: 'Hide Successors',
          action: () => {
            void hideSuccessors(item)
          }
        })
      }

      if (canShowPredecessors(item)) {
        menuItems.push({
          title: 'Show Predecessors',
          action: () => {
            void showPredecessors(item)
          }
        })
      }

      if (canHidePredecessors(item)) {
        menuItems.push({
          title: 'Hide Predecessors',
          action: () => {
            void hidePredecessors(item)
          }
        })
      }
    }
  } else {
    // empty canvas context menu
    if (canClearConnectedItemsHighlight()) {
      menuItems.push({
        title: 'Clear Connected Entities Highlight',
        action: () => {
          clearConnectedItemsHighlight()
        }
      })
    }
    if (canShowAll()) {
      menuItems.push({
        title: 'Show Entire Diagram',
        action: () => {
          showAll()
        }
      })
    }
  }

  return menuItems
}
