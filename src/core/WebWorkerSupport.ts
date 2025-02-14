import {
  ComponentArrangementPolicy,
  EdgeLabelPlacement,
  FromSketchLayerAssigner,
  HierarchicalLayout,
  HierarchicalLayoutEdgeDescriptor,
  HierarchicalLayoutRoutingStyle,
  ILayoutAlgorithm,
  LayoutAnchoringStage,
  LayoutAnchoringStageData,
  LayoutExecutorAsyncWorker,
  LayoutGraph,
  License,
  RoutingStyleDescriptor
} from '@yfiles/yfiles'
import { LayoutOptions } from '../CompanyOwnership.tsx'
import { defaultLayoutOptions } from './defaults.ts'

export function createLayout(incremental: boolean, layoutOptions: LayoutOptions): ILayoutAlgorithm {
  let layout = new HierarchicalLayout({
    defaultEdgeDescriptor: new HierarchicalLayoutEdgeDescriptor({
      routingStyleDescriptor: new RoutingStyleDescriptor(HierarchicalLayoutRoutingStyle.POLYLINE)
    }),
    layoutOrientation: layoutOptions.direction ?? defaultLayoutOptions.direction,
    edgeLabelPlacement: EdgeLabelPlacement.INTEGRATED
  })

  layout.fromSketchMode = incremental

  layout.defaultNodeDescriptor.layerAlignment = 0

  layout.defaultEdgeDescriptor.minimumFirstSegmentLength =
    layoutOptions.minimumFirstSegmentLength ?? defaultLayoutOptions.minimumFirstSegmentLength!
  layout.defaultEdgeDescriptor.minimumLastSegmentLength =
    layoutOptions.minimumLastSegmentLength ?? defaultLayoutOptions.minimumLastSegmentLength!
  layout.defaultEdgeDescriptor.routingStyleDescriptor = new RoutingStyleDescriptor({
    routingStyle: layoutOptions.routingStyle ?? defaultLayoutOptions.routingStyle!
  })

  // do not expand group node vertically
  layout.coordinateAssigner.groupCompaction = true

  if (incremental) {
    layout.core.fixedElementsLayerAssigner = new FromSketchLayerAssigner({
      maximumNodeSize: 10
    })
  }

  layout.stopDuration =
    layoutOptions.maximumDuration ??
    defaultLayoutOptions.maximumDuration ??
    Number.POSITIVE_INFINITY

  layout.minimumLayerDistance =
    layoutOptions.minimumLayerDistance ?? defaultLayoutOptions.minimumLayerDistance ?? 0

  layout.componentArrangementPolicy = ComponentArrangementPolicy.COMPACT

  return new LayoutAnchoringStage({
    coreLayout: layout
  })
}

function createLayoutData() {
  return new LayoutAnchoringStageData({ nodeAnchoringPolicies: 'upper-left' })
}

function applyLayout(graph: LayoutGraph, incremental: boolean, layoutOptions: LayoutOptions): void {
  const layout = createLayout(incremental, layoutOptions)
  const layoutData = createLayoutData()
  graph.applyLayout(layout, layoutData)
}

/**
 * Initializes the Web Worker for the layout calculation.
 *
 * Web Workers must be provided by the application using the company ownership component,
 * if worker layout is required. The Worker itself is very bare-bones and the Worker
 * layout feature can be used as follows:
 *
 * ```ts
 * // in LayoutWorker.ts
 * import { initializeWebWorker } from '@yworks/react-yfiles-company-ownership/WebWorkerSupport'
 * initializeWebWorker(self)
 * ```
 *
 * ```tsx
 * // in index.tsx
 * const layoutWorker = new Worker(new URL('./LayoutWorker', import.meta.url), {
 *   type: 'module'
 * })
 *
 * // ...
 *
 * return <CompanyOwnership data={data} layoutWorker={layoutWorker}></CompanyOwnership>
 * ```
 */
export function initializeWebWorker(self: Window) {
  self.addEventListener(
    'message',
    e => {
      if (e.data.license) {
        License.value = e.data.license
        self.postMessage('licensed')
        return
      }

      if (e.data === 'check-is-ready') {
        // signal that the Web Worker thread is ready to execute
        self.postMessage('ready')
        return
      }

      const incremental = e.data.incremental
      const layoutOptions = e.data.layoutOptions as LayoutOptions

      new LayoutExecutorAsyncWorker(graph => applyLayout(graph, incremental, layoutOptions))
        .process(e.data)
        .then(data => {
          self.postMessage(data)
        })
        .catch(errorObj => {
          self.postMessage(errorObj)
        })
    },
    false
  )

  // signal that the Web Worker thread is ready to execute
  self.postMessage('ready')
}
