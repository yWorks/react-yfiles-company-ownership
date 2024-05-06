import {
  DefaultGraph,
  delegate,
  FilteredGraphWrapper,
  type GraphComponent,
  type IEnumerable,
  type IGraph,
  INode,
  type IPort,
  Neighborhood,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  TraversalDirection,
  TreeLayout
} from 'yfiles'
import { getFilteredGraphWrapper } from '../CompanyOwnershipModel.ts'
import { getNeighborhoodIndicatorManager } from './NeighborhoodIndicatorManager.ts'
import { LayoutSupport } from './LayoutSupport.ts'

/**
 * A graph wrapper that can hide and show parts of a tree and keeps the layout up to date.
 *
 * It provides the following operations:
 * - {@link CollapsibleTree#executeHideChildren hide children}
 * - {@link CollapsibleTree#executeShowChildren show children}
 * - {@link CollapsibleTree#executeHideParent hide parent}
 * - {@link CollapsibleTree#executeShowParent show parent}
 * - {@link CollapsibleTree#executeShowAll show all}
 * - {@link CollapsibleTree#zoomToItem zoom to item}
 *
 * To hide and show items, the class manages a {@link FilteredGraphWrapper} and incrementally
 * applies a {@link TreeLayout} after each update.
 */
export class CollapsibleTree {
  private readonly itemsHiddenByCollapse: Set<INode> = new Set()
  private readonly itemsHiddenByGenealogy: Set<INode> = new Set()
  readonly filteredGraph: FilteredGraphWrapper

  private doingLayout = false

  private graphUpdatedListener: (() => void) | null = null
  private collapsedStateUpdatedListener: ((port: IPort, collapsed: boolean) => void) | null = null

  constructor(
    private readonly _graphComponent: GraphComponent,
    readonly completeGraph: IGraph = new DefaultGraph(),
    private readonly layoutSupport: LayoutSupport
  ) {
    const nodeFilter = (node: INode): boolean =>
      !this.itemsHiddenByCollapse.has(node) && !this.itemsHiddenByGenealogy.has(node)
    this.filteredGraph = new FilteredGraphWrapper(completeGraph, nodeFilter)
  }

  get graphComponent(): GraphComponent {
    return this._graphComponent
  }

  /**
   * Adds an event listener to the graphUpdated event that is fired after the filtered graph
   * has changed and the layout was updated.
   */
  addGraphUpdatedListener(listener: () => void): void {
    this.graphUpdatedListener = delegate.combine(this.graphUpdatedListener, listener)
  }

  removeGraphUpdatedListener(listener: () => void): void {
    this.graphUpdatedListener = delegate.remove(this.graphUpdatedListener, listener)
  }

  /**
   * Adds an event listener to the collapsedStateUpdated event that is fired when the collapsed
   * state of a port has changed.
   */
  addCollapsedStateUpdatedListener(listener: (port: IPort, collapsed: boolean) => void): void {
    this.collapsedStateUpdatedListener = delegate.combine(
      this.collapsedStateUpdatedListener,
      listener
    )
  }

  removeCollapsedStateUpdatedListener(listener: (port: IPort, collapsed: boolean) => void): void {
    this.collapsedStateUpdatedListener = delegate.remove(
      this.collapsedStateUpdatedListener,
      listener
    )
  }

  /**
   * Hides the children of the given node and updates the layout.
   */
  async executeHideChildren(item: INode): Promise<void> {
    if (!this.canExecuteHideChildren(item)) {
      return Promise.resolve()
    }

    const descendants = CollapsibleTree.collectDescendants(this.completeGraph, item)

    for (const node of descendants) {
      this.updateCollapsedState(node, true)
    }
    this.updateCollapsedState(item, true)

    // update collapse state of sibling nodes
    const allSiblingNodes = this.completeGraph
      .outEdgesAt(item)
      .map(outEdge => outEdge.targetNode)
      .flatMap(targetNode => this.completeGraph.inEdgesAt(targetNode!))
      .map(edge => edge.sourceNode!)
      .filter(sourceNode => sourceNode !== item)
      .distinct()
    allSiblingNodes.forEach(node => {
      if (this.filteredGraph.outEdgesAt(node).some(edge => descendants.has(edge.targetNode!))) {
        this.updateCollapsedState(node, true)
      }
    })

    this.removeEmptyGroups(descendants)
    this.filteredGraph.nodePredicateChanged()

    await this.refreshLayout(item, descendants, true)

    this.addToHiddenNodes(descendants)
    this.filteredGraph.nodePredicateChanged()

    this.onGraphUpdated()
  }

  /**
   * @returns Whether the children of the given node can be hidden.
   */
  canExecuteHideChildren(item: INode): boolean {
    return !this.doingLayout && this.filteredGraph.outDegree(item) > 0
  }

  /**
   * Shows the children of the given node and updates the layout.
   */
  async executeShowChildren(item: INode): Promise<void> {
    if (!this.canExecuteShowChildren(item)) {
      return Promise.resolve()
    }

    const descendants = CollapsibleTree.collectDescendants(this.completeGraph, item)
    const incrementalNodes = new Set(
      Array.from(descendants).filter(node => !this.filteredGraph.contains(node))
    )

    this.showChildren(item)

    // inform the filter that the predicate changed, and thus the graph needs to be updated
    this.filteredGraph.nodePredicateChanged()

    await this.refreshLayout(item, incrementalNodes, false)

    this.updateCollapsedState(item, false)

    // update collapse state of sibling nodes
    const allSiblingNodes = this.completeGraph
      .outEdgesAt(item)
      .map(outEdge => outEdge.targetNode)
      .flatMap(targetNode => this.completeGraph.inEdgesAt(targetNode!))
      .filter(edge => edge.sourceNode !== item)
      .map(edge => edge.sourceNode!)
      .distinct()
    allSiblingNodes.forEach(node => {
      if (this.completeGraph.outEdgesAt(node).every(edge => descendants.has(edge.targetNode!))) {
        this.updateCollapsedState(node, false)
      }
    })

    this.onGraphUpdated()
  }

  private showChildren(node: INode): void {
    for (const childEdge of this.completeGraph.outEdgesAt(node)) {
      const child = childEdge.targetNode!
      this.itemsHiddenByCollapse.delete(child)
      CollapsibleTree.restoreGroup(this.completeGraph, this.itemsHiddenByCollapse, child)
      this.onCollapsedStateUpdated(childEdge.sourcePort!, false)
    }
  }

  /**
   * @returns Whether the children of the given node can be shown.
   */
  canExecuteShowChildren(item: INode): boolean {
    return (
      !this.doingLayout && this.filteredGraph.outDegree(item) !== this.completeGraph.outDegree(item)
    )
  }

  /**
   * Shows the parent of the given node and updates the layout.
   *
   * In contrast to {@link executeHideParent}, it only shows the
   * direct parent and not any of its children.
   */
  async executeShowParent(node: INode): Promise<void> {
    if (this.doingLayout) {
      return Promise.resolve()
    }

    const incrementalNodes = new Set<INode>()
    this.showParents(node, incrementalNodes)
    this.filteredGraph.nodePredicateChanged()

    await this.refreshLayout(node, incrementalNodes, false)

    this.onGraphUpdated()
  }

  private showParents(node: INode, incrementalNodes: Set<INode>): void {
    for (const parentEdge of this.completeGraph.inEdgesAt(node)) {
      const parent = parentEdge.sourceNode!
      this.itemsHiddenByCollapse.delete(parent)
      CollapsibleTree.restoreGroup(this.completeGraph, this.itemsHiddenByCollapse, parent)
      incrementalNodes.add(parent)
    }
  }

  /**
   * @returns Whether the parent of the given node can be shown.
   */
  canExecuteShowParent(node: INode): boolean {
    return (
      !this.doingLayout &&
      this.filteredGraph.inDegree(node) === 0 &&
      this.completeGraph.inDegree(node) > 0
    )
  }

  /**
   * Hides the parent of the given node and updates the layout.
   *
   * In contrast to {@link executeShowParent}, this method also hides all ancestors
   * and their descendants and other isolated trees leaving only the node and its descendants
   * in the graph.
   */
  async executeHideParent(node: INode): Promise<void> {
    if (this.doingLayout) {
      return Promise.resolve()
    }
    const nodes = CollapsibleTree.collectAllNodesExceptSubtree(this.completeGraph, node)

    this.removeEmptyGroups(nodes)
    this.filteredGraph.nodePredicateChanged()

    await this.refreshLayout(node, nodes, true)

    this.addToHiddenNodes(nodes)
    this.filteredGraph.nodePredicateChanged()

    this.onGraphUpdated()
  }

  /**
   * @returns Whether the parent of the given node can be hidden.
   */
  canExecuteHideParent(node: INode): boolean {
    return !this.doingLayout && this.filteredGraph.inDegree(node) > 0
  }

  /**
   * Shows all nodes and updates the layout.
   */
  async executeShowAll(): Promise<void> {
    if (this.doingLayout) {
      return Promise.resolve()
    }
    const incrementalNodes = new Set([
      ...this.itemsHiddenByCollapse,
      ...this.itemsHiddenByGenealogy
    ])
    this.itemsHiddenByCollapse.clear()
    this.itemsHiddenByGenealogy.clear()

    for (const edge of this.completeGraph.edges) {
      this.onCollapsedStateUpdated(edge.sourcePort!, false)
    }

    // inform the filter that the predicate changed, and thus the graph needs to be updated
    this.filteredGraph.nodePredicateChanged()

    await this.refreshLayout(
      this._graphComponent.currentItem as INode | null,
      incrementalNodes,
      false
    )

    this.onGraphUpdated()
  }

  /**
   * @returns Whether {@link executeShowAll} can be executed.
   */
  canExecuteShowAll(): boolean {
    return (
      (this.itemsHiddenByCollapse.size !== 0 || this.itemsHiddenByGenealogy.size !== 0) &&
      !this.doingLayout
    )
  }

  /**
   * Refreshes the node after modifications on the tree.
   * @returns a promise which is resolved when the layout has been executed.
   */
  private async refreshLayout(
    centerNode: INode | null,
    incrementalNodes: Set<INode>,
    collapse: boolean
  ): Promise<void> {
    if (this.doingLayout) {
      return Promise.resolve()
    }
    this.doingLayout = true

    if (!collapse) {
      // move the incremental nodes between their neighbors before expanding for a smooth animation
      this.prepareSmoothExpandLayoutAnimation(incrementalNodes)
    }

    this.layoutSupport!.runLayout(
      incrementalNodes.size > 0,
      [...incrementalNodes],
      centerNode,
      true
    ).then(() => {
      this.doingLayout = false
    })
  }

  /**
   * Moves incremental nodes to a location between their neighbors before expanding for a smooth animation.
   */
  private prepareSmoothExpandLayoutAnimation(incrementalNodes: Set<INode>): void {
    const graph = this._graphComponent.graph

    // mark the new nodes and place them between their neighbors
    const layoutData = new PlaceNodesAtBarycenterStageData({
      affectedNodes: incrementalNodes
    })

    const layout = new PlaceNodesAtBarycenterStage()
    graph.applyLayout(layout, layoutData)
  }

  private addToHiddenNodes(nodes: Iterable<INode>): void {
    for (const node of nodes) {
      this.itemsHiddenByCollapse.add(node)
    }
  }

  /**
   * Set the collapsed state to all the node's ports.
   */
  private updateCollapsedState(node: INode, collapsed: boolean): void {
    for (const outEdge of this.completeGraph.outEdgesAt(node)) {
      this.onCollapsedStateUpdated(outEdge.sourcePort!, collapsed)
    }
  }

  /**
   * Restores the group containing the given node if needed.
   */
  private static restoreGroup(graph: IGraph, hiddenNodesSet: Set<INode>, node: INode): void {
    const parent = graph.getParent(node)
    if (parent && hiddenNodesSet.has(parent)) {
      hiddenNodesSet.delete(parent)
    }
  }

  /**
   * Removes all groups in the given graph that will be empty after removing the given nodes.
   */
  private removeEmptyGroups(nodesToHide: Set<INode>): void {
    const emptyGroups = CollapsibleTree.findEmptyGroups(this.filteredGraph, nodesToHide).toArray()
    for (const group of emptyGroups) {
      this.itemsHiddenByCollapse.add(group)
    }
  }

  private static findEmptyGroups(graph: IGraph, nodesToHide: Set<INode>): IEnumerable<INode> {
    return graph.nodes.filter(
      node =>
        graph.isGroupNode(node) &&
        graph.degree(node) === 0 &&
        graph.getChildren(node).every(child => nodesToHide.has(child))
    )
  }

  /**
   * @returns all descendants of the passed node excluding the node itself.
   */
  private static collectDescendants(graph: IGraph, root: INode): Set<INode> {
    const nodes = new Set<INode>()
    const queue = [root]
    while (queue.length > 0) {
      const node = queue.pop()!
      for (const outEdge of graph.outEdgesAt(node)) {
        queue.unshift(outEdge.targetNode!)
        nodes.add(outEdge.targetNode!)
      }
    }
    return nodes
  }

  /**
   * Creates an array of all nodes excluding the nodes in the subtree rooted in the excluded sub-root.
   */
  private static collectAllNodesExceptSubtree(graph: IGraph, excludedRoot: INode): Set<INode> {
    const subtree = this.collectDescendants(graph, excludedRoot)
    subtree.add(excludedRoot)
    return new Set(graph.nodes.filter(node => !subtree.has(node)))
  }

  /**
   * Informs the listener that the graph was updated.
   */
  private onGraphUpdated(): void {
    this.graphUpdatedListener?.()
  }

  /**
   * Informs the listener that the collapsed state was updated.
   */
  private onCollapsedStateUpdated(port: IPort, collapsed: boolean): void {
    this.collapsedStateUpdatedListener?.(port, collapsed)
  }

  executeShowGenealogy(node: INode) {
    const graph = this.graphComponent.graph
    const filteredGraphWrapper = getFilteredGraphWrapper(this.graphComponent)

    this.itemsHiddenByCollapse.clear()
    this.itemsHiddenByGenealogy.clear()
    filteredGraphWrapper.nodePredicateChanged()
    filteredGraphWrapper.edgePredicateChanged()

    const neighborhood = new Neighborhood({
      startNodes: [node],
      traversalDirection: TraversalDirection.BOTH
    })
    const result = neighborhood.run(graph)
    const resultNodes = new Set(result.neighbors.toArray())
    resultNodes.add(node)

    // include the parent nodes in the genealogy
    const groupingSupport = graph.groupingSupport
    const genealogy = new Set<INode>()
    resultNodes.forEach(node => {
      genealogy.add(node)
      groupingSupport.getPathToRoot(node).forEach(parent => genealogy.add(parent))
    })

    // hide any node that is not part of the genealogy
    graph.nodes.forEach(node => {
      if (!genealogy.has(node)) {
        this.itemsHiddenByGenealogy.add(node)
        if (graph.isGroupNode(node)) {
          // also hide all children
          groupingSupport.getDescendants(node).forEach(child => {
            this.itemsHiddenByGenealogy.add(child)
          })
        }
      }
    })

    const neighborhoodHighlightManager = getNeighborhoodIndicatorManager(this.graphComponent)
    neighborhoodHighlightManager.deactivateHighlights()

    filteredGraphWrapper.nodePredicateChanged()
    filteredGraphWrapper.edgePredicateChanged()

    this.onGraphUpdated()

    this.layoutSupport!.runLayout(false, [], null, true).then(() => {
      neighborhoodHighlightManager.activateHighlights()
    })
  }
}
