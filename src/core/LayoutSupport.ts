import {
  FixNodeLayoutData,
  type GraphComponent,
  HierarchicLayoutData,
  INode,
  LayoutData,
  LayoutExecutor,
  LayoutExecutorAsync,
  Rect
} from 'yfiles'
import { LayoutOptions } from '../CompanyOwnership.tsx'
import { Dispatch, SetStateAction } from 'react'
import {
  defaultGraphFitInsets,
  defaultLayoutOptions,
  defaultPortAdjustmentPolicy
} from './defaults.ts'
import { registerWebWorker } from '@yworks/react-yfiles-core'
import { createLayout } from './WebWorkerSupport.ts'

export class LayoutSupport {
  private workerPromise: Promise<Worker> | null = null
  set layoutWorker(worker: Worker | undefined) {
    if (worker) {
      this.workerPromise = registerWebWorker(worker)
    } else {
      this.workerPromise = null
    }
  }
  private executorAsync: LayoutExecutorAsync | null = null
  private executor: LayoutExecutor | null = null

  public layoutOptions: LayoutOptions = defaultLayoutOptions
  public setLayoutRunning?: Dispatch<SetStateAction<boolean>>

  constructor(private readonly graphComponent: GraphComponent) {}

  private createLayoutData(
    incremental: boolean,
    incrementalNodes: INode[],
    fixedNode: INode | null = null
  ): LayoutData | null {
    let layoutData: LayoutData | null = null

    if (incremental) {
      layoutData = new HierarchicLayoutData({
        incrementalHints: (item, factory) =>
          item instanceof INode && incrementalNodes.includes(item)
            ? factory.createLayerIncrementallyHint(item)
            : null
      })
    }

    if (fixedNode) {
      const fixNodeLayoutData = new FixNodeLayoutData()
      fixNodeLayoutData.fixedNodes.item = fixedNode
      if (!layoutData) {
        layoutData = new HierarchicLayoutData()
      }
      layoutData = layoutData.combineWith(fixNodeLayoutData)
    }

    return layoutData
  }

  async runLayout(
    incremental: boolean = false,
    incrementalNodes: INode[] = [],
    fixedNode: INode | null = null,
    fitViewport = false
  ): Promise<void> {
    this.setLayoutRunning?.(true)

    const graph = this.graphComponent.graph

    if (incrementalNodes.length > 0) {
      incrementalNodes
        .map(node => graph.edgesAt(node).toArray())
        .flat()
        .forEach(edge => {
          // clear bends
          edge.bends.toArray().forEach(bend => graph.remove(bend))
        })
    }

    const executor =
      this.workerPromise !== null
        ? await this.createLayoutExecutorAsync(
            incremental,
            incrementalNodes,
            fixedNode,
            fitViewport
          )
        : await this.createLayoutExecutor(incremental, incrementalNodes, fixedNode, fitViewport)

    try {
      await executor.start()
      this.graphComponent.viewportLimiter.bounds = this.graphComponent.contentRect
    } catch (e) {
      if ((e as Record<string, unknown>).name === 'AlgorithmAbortedError') {
        console.error('Layout calculation was aborted because maximum duration time was exceeded.')
      } else {
        console.error('Something went wrong during the layout calculation')
        console.error(e)
      }
    } finally {
      this.setLayoutRunning?.(false)
    }
  }

  /**
   * When a layout animation is already running, it might have started
   * with now obsolete node sizes - stop the running animation and restore
   * the latest measured node sizes.
   */
  private async maybeCancel() {
    const syncRunning = this.executor && this.executor.running
    const asyncRunning = this.executorAsync && this.executorAsync.running
    if (syncRunning || asyncRunning) {
      const layouts = new Map<INode, Rect>()
      for (const node of this.graphComponent.graph.nodes) {
        layouts.set(node, node.layout.toRect())
      }
      await this.executor?.stop()
      await this.executorAsync?.cancel()
      for (const node of this.graphComponent.graph.nodes) {
        if (layouts.has(node)) {
          this.graphComponent.graph.setNodeLayout(node, layouts.get(node)!)
        }
      }
      for (const edge of this.graphComponent.graph.edges) {
        this.graphComponent.graph.clearBends(edge)
      }
    }
  }

  private async createLayoutExecutor(
    incremental: boolean,
    incrementalNodes: INode[],
    fixedNode: INode | null = null,
    fitViewport: boolean
  ): Promise<LayoutExecutor> {
    await this.maybeCancel()

    this.executor = new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout: createLayout(incremental, this.layoutOptions),
      layoutData: this.createLayoutData(incremental, incrementalNodes, fixedNode),
      duration: '300ms',
      animateViewport: fitViewport,
      updateContentRect: true,
      targetBoundsInsets: defaultGraphFitInsets,
      portAdjustmentPolicy: defaultPortAdjustmentPolicy
    })

    return Promise.resolve(this.executor)
  }

  private async createLayoutExecutorAsync(
    incremental: boolean,
    incrementalNodes: INode[],
    fixedNode: INode | null = null,
    fitViewport: boolean
  ): Promise<LayoutExecutorAsync> {
    await this.maybeCancel()

    const worker = await this.workerPromise!

    // helper function that performs the actual message passing to the web worker
    const webWorkerMessageHandler = (data: any): Promise<any> => {
      // keep track of the requested layout, to ignore stale layouts
      const thisRequest = data.token
      data.incremental = incremental
      data.layoutOptions = this.layoutOptions
      return new Promise((resolve, reject) => {
        worker.onmessage = e => {
          // don't resolve cancelled requests
          if (e.data && thisRequest === e.data.token) {
            if (e.data.name === 'AlgorithmAbortedError') {
              reject(e.data)
            } else {
              resolve(e.data)
            }
          }
        }

        worker.postMessage(data)
      })
    }

    this.executorAsync = new LayoutExecutorAsync({
      messageHandler: webWorkerMessageHandler,
      graphComponent: this.graphComponent,
      layoutData: this.createLayoutData(incremental, incrementalNodes, fixedNode),
      duration: '300ms',
      animateViewport: fitViewport,
      updateContentRect: true,
      targetBoundsInsets: defaultGraphFitInsets,
      portAdjustmentPolicy: defaultPortAdjustmentPolicy
    })
    return this.executorAsync
  }
}
