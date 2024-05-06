import { FilteredGraphWrapper, GraphComponent, IGraph, INode } from 'yfiles'
import { type ExportSettings, type PrintSettings } from '@yworks/react-yfiles-core'
import { Connection, Entity, EntityId } from './CompanyOwnership.tsx'
import { LayoutSupport } from './core/LayoutSupport.ts'

/**
 * The CompanyOwnershipModel provides common functionality to interact with the {@link CompanyOwnership} component.
 */
export interface CompanyOwnershipModel {
  /**
   * The [yFiles GraphComponent]{@link http://docs.yworks.com/yfileshtml/#/api/GraphComponent} used
   * by the {@link CompanyOwnership} component to display the graph.
   *
   * This property is intended for advanced users who have a familiarity with the
   * [yFiles for HTML]{@link https://www.yworks.com/products/yfiles-for-html} library.
   */
  graphComponent: GraphComponent

  /**
   * Whether the item is a connection.
   */
  isConnection(item: any): item is Connection

  /**
   * Highlights an item and all other items connected to it.
   * Two items are connected when there exists an edge path
   * between them, even if there are several hops (items)
   * on the path.
   */
  highlightConnectedItems(item: Entity): void

  /**
   * Whether there is currently a connected items
   * highlight visualized in the graph that can be cleared.
   */
  canClearConnectedItemsHighlight(): boolean

  /**
   * Clears the connected items highlight visualization.
   */
  clearConnectedItemsHighlight(): void

  /**
   * Shows all items in the company ownership.
   */
  showAll(): void

  /**
   * Whether there are any hidden items to show.
   */
  canShowAll(): boolean

  /**
   * Refreshes the company ownership layout.
   * If the incremental parameter is set to true, the layout considers certain
   * items as fixed and arranges only the items contained in the incrementalItems array.
   */
  applyLayout(
    incremental?: boolean,
    incrementalItems?: Entity[],
    fixedItem?: Entity,
    fitViewport?: boolean
  ): Promise<void>

  /**
   * Pans the viewport to the center of the given items.
   */
  zoomTo(items: (Entity | Connection)[]): void

  /**
   * Increases the zoom level.
   */
  zoomIn(): void

  /**
   * Decreases the zoom level.
   */
  zoomOut(): void

  /**
   * Fits the chart inside the viewport.
   */
  fitContent(insets?: number): void

  /**
   * Resets the zoom level to 1.
   */
  zoomToOriginal(): void

  /**
   * Retrieves the items that match the search currently.
   */
  getSearchHits: () => Entity[]

  /**
   * Exports the company ownership chart to an SVG file.
   * @throws Exception if the diagram cannot be exported.
   * The exception may occur when the diagram contains images from cross-origin sources.
   * In this case, disable {@link ExportSettings.inlineImages} and encode the icons manually to base64.
   */
  exportToSvg(exportSettings?: ExportSettings): Promise<void>

  /**
   * Exports the company ownership chart to a PNG Image.
   * @throws Exception if the diagram cannot be exported.
   * The exception may occur when the diagram contains images from cross-origin sources.
   * In this case, disable {@link ExportSettings.inlineImages} and encode the icons manually to base64.
   */
  exportToPng(exportSettings?: ExportSettings): Promise<void>

  /**
   * Exports and prints the company ownership chart.
   */
  print(printSettings?: PrintSettings): Promise<void>

  /**
   * Triggers a re-rendering of the chart.
   * This may become useful if properties in the data change and the
   * visualization should update accordingly.
   */
  refresh(): void

  /**
   * Filters the graph for all items that are connected to
   * the given item.
   * Connections can be over multiple hops.
   */
  showGenealogy(item: Entity): void

  /**
   * Adds a listener called whenever companies are shown or hidden.
   */
  addGraphUpdatedListener(listener: () => void): void
  /**
   * Removes a listener added in {@link CompanyOwnershipModel.addGraphUpdatedListener}.
   */
  removeGraphUpdatedListener(listener: () => void): void

  /**
   * Returns the currently visible items of the company ownership chart.
   */
  getVisibleItems(): Entity[]

  /**
   * Shows the predecessors of the given item.
   */
  showPredecessors(item: Entity): Promise<void>
  /**
   * Whether the predecessors of the given item is hidden.
   */
  canShowPredecessors(item: Entity): boolean

  /**
   * Hides the predecessors of the given item.
   */
  hidePredecessors(item: Entity): Promise<void>
  /**
   * Whether the predecessors of the given item is visible.
   */
  canHidePredecessors(item: Entity): boolean

  /**
   * Shows the successors of the given item.
   */
  showSuccessors(item: Entity): Promise<void>
  /**
   * Whether the successors of the given item are hidden.
   */
  canShowSuccessors(item: Entity): boolean

  /**
   * Hides the successors of the given item.
   */
  hideSuccessors(item: Entity): Promise<void>
  /**
   * Whether the successors of the given item are visible.
   */
  canHideSuccessors(item: Entity): boolean
}

export interface CompanyOwnershipModelInternal extends CompanyOwnershipModel {
  layoutSupport: LayoutSupport | undefined
  onRendered: () => void
  hasReactItems: boolean
}

export function getNode(item: Entity | null, graph: IGraph): INode | null {
  return item ? getNodeFromId(item.id, graph) : null
}

export function getNodeFromId(id: EntityId, graph: IGraph): INode | null {
  return graph.nodes.find(node => node.tag.id === id)
}

export function getFilteredGraphWrapper(graphComponent: GraphComponent): FilteredGraphWrapper {
  return graphComponent.graph as FilteredGraphWrapper
}
