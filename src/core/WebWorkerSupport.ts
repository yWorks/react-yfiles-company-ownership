import {
  AsIsLayerer,
  ComponentArrangementPolicy,
  FixNodeLayoutStage,
  GroupCompactionPolicy,
  HierarchicLayout,
  HierarchicLayoutRoutingStyle,
  ILayoutAlgorithm,
  LayoutExecutorAsyncWorker,
  LayoutGraph,
  License,
  SimplexNodePlacer
} from 'yfiles'
import { LayoutOptions } from '../CompanyOwnership.tsx'
import { defaultLayoutOptions } from './defaults.ts'

export function createLayout(incremental: boolean, layoutOptions: LayoutOptions): ILayoutAlgorithm {
  let layout = new HierarchicLayout({
    layoutOrientation: layoutOptions.direction ?? defaultLayoutOptions.direction,
    integratedEdgeLabeling: true
  })

  layout.layoutMode = incremental ? 'incremental' : 'from-scratch'

  layout.nodeLayoutDescriptor.layerAlignment = 0

  layout.edgeLayoutDescriptor.minimumFirstSegmentLength =
    layoutOptions.minimumFirstSegmentLength ?? defaultLayoutOptions.minimumFirstSegmentLength!
  layout.edgeLayoutDescriptor.minimumLastSegmentLength =
    layoutOptions.minimumLastSegmentLength ?? defaultLayoutOptions.minimumLastSegmentLength!
  layout.edgeLayoutDescriptor.routingStyle = new HierarchicLayoutRoutingStyle({
    routingStyle: layoutOptions.routingStyle ?? defaultLayoutOptions.routingStyle!
  })

  // do not expand group node vertically
  layout.compactGroups = true
  const nodePlacer = layout.nodePlacer as SimplexNodePlacer
  nodePlacer.groupCompactionStrategy = GroupCompactionPolicy.MAXIMAL
  if (incremental) {
    layout.fixedElementsLayerer = new AsIsLayerer({
      maximumNodeSize: 10
    })
  }

  layout.maximumDuration =
    layoutOptions.maximumDuration ??
    defaultLayoutOptions.maximumDuration ??
    Number.POSITIVE_INFINITY

  layout.minimumLayerDistance =
    layoutOptions.minimumLayerDistance ?? defaultLayoutOptions.minimumLayerDistance ?? 0

  layout.componentArrangementPolicy = ComponentArrangementPolicy.COMPACT

  return new FixNodeLayoutStage({ coreLayout: layout, fixPointPolicy: 'upper-left' })
}

function applyLayout(graph: LayoutGraph, incremental: boolean, layoutOptions: LayoutOptions): void {
  const layout = createLayout(incremental, layoutOptions)
  layout.applyLayout(graph)
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
