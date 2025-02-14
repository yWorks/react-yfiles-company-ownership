import { Connection, Entity, EntityId } from './CompanyOwnership.tsx'

import { getNode, getNodeFromId, CompanyOwnershipModelInternal } from './CompanyOwnershipModel.ts'

import { GraphComponent, Command, INode, Insets, MutableRectangle } from '@yfiles/yfiles'

import {
  exportImageAndSave,
  type ExportSettings,
  exportSvgAndSave,
  printDiagram,
  type PrintSettings
} from '@yworks/react-yfiles-core'

import { getNeighborhoodIndicatorManager } from './core/NeighborhoodIndicatorManager.ts'

import { LayoutSupport } from './core/LayoutSupport.ts'
import { componentBackgroundColor, defaultExportMargins } from './core/defaults.ts'
import { CollapsibleTree } from './core/CollapsibleTree.ts'

export function createCompanyOwnershipModel(
  graphComponent: GraphComponent,
  collapsibleTree: CollapsibleTree,
  layoutSupport: LayoutSupport
): CompanyOwnershipModelInternal {
  let onRenderedCallback: null | (() => void) = null

  // this is a hack, so we have something like `await nextTick()`
  // that we can use instead of `setTimeout()`
  const setRenderedCallback = (cb: () => void) => {
    onRenderedCallback = cb
  }

  const onRendered = () => {
    onRenderedCallback?.()
    onRenderedCallback = null
  }

  function showGenealogy(item: Entity) {
    const node = getNode(item, graphComponent.graph)
    if (node) {
      clearConnectedItemsHighlight()
      collapsibleTree.executeShowGenealogy(node)
    }
  }

  function isConnection(item: any): item is Connection {
    return 'sourceId' in item || 'connections' in item
  }

  function applyLayout(
    incremental?: boolean,
    incrementalItems?: Entity[],
    fixedItem: Entity | null = null,
    fitViewport = false
  ) {
    if (!layoutSupport) {
      return Promise.resolve()
    }

    const incrementalNodes: INode[] = []
    incrementalItems?.forEach(item => {
      const graph = graphComponent.graph
      const node = getNode(item, graph)
      if (node) {
        incrementalNodes.push(node)
      }
    })

    const fixedNode = getNode(fixedItem, graphComponent.graph)

    return layoutSupport.runLayout(incremental ?? false, incrementalNodes, fixedNode, fitViewport)
  }

  function highlightConnectedItems(item: Entity) {
    const startNode = getNode(item, graphComponent.graph)!
    if (!startNode) {
      // node is currently not visible in the view graph
      return
    }

    const neighborhoodIndicatorManager = getNeighborhoodIndicatorManager(graphComponent)
    neighborhoodIndicatorManager.highlightNeighborhood(startNode)
  }

  function canClearConnectedItemsHighlight() {
    const neighborhoodIndicatorManager = getNeighborhoodIndicatorManager(graphComponent)
    return neighborhoodIndicatorManager.items ? neighborhoodIndicatorManager.items.size > 0 : false
  }

  function clearConnectedItemsHighlight() {
    const neighborhoodIndicatorManager = getNeighborhoodIndicatorManager(graphComponent)
    neighborhoodIndicatorManager.clearHighlights()
  }

  async function showAll() {
    const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(graphComponent)
    neighborhoodHighlightManager.clearHighlights()

    await collapsibleTree.executeShowAll()
  }

  function canShowAll(): boolean {
    return collapsibleTree.canExecuteShowAll()
  }

  function zoomIn() {
    graphComponent.executeCommand(Command.INCREASE_ZOOM, null)
  }

  function zoomOut() {
    graphComponent.executeCommand(Command.DECREASE_ZOOM, null)
  }

  function fitContent(insets: number = 0) {
    graphComponent.fitGraphBounds(new Insets(insets), true)
  }

  function zoomToOriginal() {
    graphComponent.executeCommand(Command.ZOOM, 1.0)
  }

  async function exportToSvg(exportSettings: ExportSettings) {
    const settings = Object.assign(
      {
        zoom: graphComponent.zoom,
        scale: graphComponent.zoom,
        margins: defaultExportMargins,
        inlineImages: true,
        background: componentBackgroundColor
      } as ExportSettings,
      exportSettings
    )

    const callback = _hasReactItems
      ? setRenderedCallback
      : (resolve: () => void) => {
          resolve()
        }
    await exportSvgAndSave(settings, graphComponent, callback)
  }

  async function exportToPng(exportSettings: ExportSettings) {
    const settings = Object.assign(
      {
        zoom: graphComponent.zoom,
        scale: graphComponent.zoom,
        margins: defaultExportMargins,
        inlineImages: true,
        background: componentBackgroundColor
      } as ExportSettings,
      exportSettings
    )

    const callback = _hasReactItems
      ? setRenderedCallback
      : (resolve: () => void) => {
          resolve()
        }
    await exportImageAndSave(settings, graphComponent, callback)
  }

  async function print(printSettings: PrintSettings) {
    const settings = Object.assign(
      {
        zoom: graphComponent.zoom,
        scale: 1.0,
        margins: defaultExportMargins
      } as PrintSettings,
      printSettings
    )
    await printDiagram(settings, graphComponent)
  }

  function refresh() {
    graphComponent.invalidate()
  }

  function zoomTo(items: (Entity | Connection)[]): void {
    if (items.length === 0) {
      return
    }

    const graph = graphComponent.graph

    const targetBounds = new MutableRectangle()

    items.forEach(item => {
      if (isConnection(item)) {
        const source = getNodeFromId(item.sourceId as EntityId, graph)!
        const target = getNodeFromId(item.targetId as EntityId, graph)!
        targetBounds.add(source.layout)
        targetBounds.add(target.layout)
      } else {
        const node = getNode(item as Entity, graph)!
        targetBounds.add(node.layout)
      }
    })

    const enlargedTargetBounds = targetBounds.toRect().getEnlarged(200)

    // never decrease zoom on "zoom to item"
    const gcSize = graphComponent.size
    const newZoom = Math.min(
      gcSize.width / enlargedTargetBounds.width,
      gcSize.height / enlargedTargetBounds.height
    )
    graphComponent.zoomToAnimated(
      Math.max(newZoom, graphComponent.zoom),
      enlargedTargetBounds.center
    )
  }

  function addGraphUpdatedListener(listener: () => void) {
    collapsibleTree.addGraphUpdatedListener(listener)
  }

  function removeGraphUpdatedListener(listener: () => void) {
    collapsibleTree.removeGraphUpdatedListener(listener)
  }

  function getVisibleItems(): Entity[] {
    return collapsibleTree.graphComponent.graph.nodes.map(item => item.tag).toArray()
  }

  async function showPredecessors(item: Entity) {
    const node = getNode(item, graphComponent.graph)
    if (node) {
      const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(graphComponent)
      neighborhoodHighlightManager.clearHighlights()
      await collapsibleTree.executeShowParent(node)
    }
  }

  function canShowPredecessors(item: Entity): boolean {
    const node = getNode(item, graphComponent.graph)
    if (node) {
      return collapsibleTree.canExecuteShowParent(node)
    }
    return false
  }

  async function hidePredecessors(item: Entity) {
    const node = getNode(item, graphComponent.graph)
    if (node) {
      const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(graphComponent)
      neighborhoodHighlightManager.clearHighlights()
      await collapsibleTree.executeHideParent(node)
    }
  }

  function canHidePredecessors(item: Entity): boolean {
    const node = getNode(item, graphComponent.graph)
    if (node) {
      return collapsibleTree.canExecuteHideParent(node)
    }
    return false
  }

  async function showSuccessors(item: Entity) {
    const node = getNode(item, graphComponent.graph)
    if (node) {
      const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(graphComponent)
      neighborhoodHighlightManager.clearHighlights()
      await collapsibleTree.executeShowChildren(node)
    }
  }

  function canShowSuccessors(item: Entity): boolean {
    const node = getNode(item, graphComponent.graph)
    if (node) {
      return collapsibleTree.canExecuteShowChildren(node)
    }
    return false
  }

  async function hideSuccessors(item: Entity) {
    const node = getNode(item, graphComponent.graph)
    if (node) {
      const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(graphComponent)
      neighborhoodHighlightManager.clearHighlights()
      await collapsibleTree.executeHideChildren(node)
    }
  }

  function canHideSuccessors(item: Entity): boolean {
    const node = getNode(item, graphComponent.graph)
    if (node) {
      return collapsibleTree.canExecuteHideChildren(node)
    }
    return false
  }

  let _hasReactItems = false

  return {
    graphComponent,

    layoutSupport,
    applyLayout,

    canClearConnectedItemsHighlight,
    clearConnectedItemsHighlight,
    highlightConnectedItems,
    showGenealogy,

    canShowAll,
    showAll,

    exportToPng,
    exportToSvg,
    print,

    isConnection,

    fitContent,
    zoomIn,
    zoomOut,
    zoomTo,
    zoomToOriginal,

    getSearchHits: () => [], // will be replaced during initialization

    onRendered,
    refresh,

    addGraphUpdatedListener,
    removeGraphUpdatedListener,
    getVisibleItems,

    showPredecessors,
    canShowPredecessors,
    hidePredecessors,
    canHidePredecessors,
    showSuccessors,
    canShowSuccessors,
    hideSuccessors,
    canHideSuccessors,

    get hasReactItems() {
      return _hasReactItems
    },

    set hasReactItems(value) {
      _hasReactItems = value
    }
  }
}
