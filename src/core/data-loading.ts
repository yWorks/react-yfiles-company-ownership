import {
  DefaultLabelStyle,
  EdgesSource,
  GraphBuilder,
  IEdge,
  type IGraph,
  type INode,
  NodesSource
} from 'yfiles'
import {
  Connection,
  CompanyOwnershipData,
  Entity,
  ConnectionLabelProvider,
  ConnectionStyleProvider,
  EntityLabelProvider,
  Ownership,
  SimpleLabel
} from '../CompanyOwnership.tsx'
import {
  convertToPolylineEdgeStyle,
  NodeRenderInfo,
  ReactComponentHtmlNodeStyle,
  RenderNodeProps as RenderEntityProps
} from '@yworks/react-yfiles-core'
import { ComponentType, Dispatch, SetStateAction } from 'react'
import { CompanyOwnershipModel, getNode } from '../CompanyOwnershipModel.ts'
import { getNodeStyle } from '../styles/CompanyOwnershipNodeStyles.ts'
import { defaultOwnershipEdgeStyle, defaultRelationEdgeStyle } from './defaults.ts'

export class GraphManager<TEntity extends Entity, TConnection extends Connection> {
  public nodeData: TEntity[] = []
  public connectionsData: TConnection[] = []
  public renderEntities?: ComponentType<RenderEntityProps<TEntity>>
  public connectionStyleProvider?: ConnectionStyleProvider<TEntity, TConnection>
  public connectionLabelProvider?: ConnectionLabelProvider<TConnection>
  public itemLabelProvider?: EntityLabelProvider<TEntity>
  public incrementalElements: TEntity[] = []
  constructor(
    public graphBuilder?: GraphBuilder,
    public nodesSource?: NodesSource<TEntity>,
    public connectionsSource?: EdgesSource<TConnection>
  ) {}

  updateGraph(
    data: CompanyOwnershipData<TEntity, TConnection>,
    renderEntity?: ComponentType<RenderEntityProps<TEntity>>,
    connectionStyleProvider?: ConnectionStyleProvider<TEntity, TConnection>,
    connectionLabelProvider?: ConnectionLabelProvider<TConnection>,
    itemLabelProvider?: EntityLabelProvider<TEntity>
  ) {
    const nodeData = data.companies
    const connectionsData = data.connections

    // find the new elements and mark them as incremental
    this.incrementalElements = compareData(this.nodeData, nodeData)

    this.nodeData = nodeData
    this.connectionsData = connectionsData

    if (!this.graphBuilder || !this.nodesSource || !this.connectionsSource) {
      return
    }

    if (renderEntity) {
      this.renderEntities = renderEntity
    }
    if (connectionStyleProvider) {
      this.connectionStyleProvider = connectionStyleProvider
    }
    if (connectionLabelProvider) {
      this.connectionLabelProvider = connectionLabelProvider
    } else {
      this.connectionLabelProvider = item => {
        return item.type === 'Ownership' && typeof (item as Ownership).ownership !== 'undefined'
          ? {
              text: String((item as Ownership).ownership)
            }
          : undefined
      }
    }
    if (itemLabelProvider) {
      this.itemLabelProvider = itemLabelProvider
    } else {
      this.itemLabelProvider = item => {
        return item.name
          ? {
              text: item.name
            }
          : {
              text: `ID: ${item.id}`
            }
      }
    }
    this.graphBuilder.setData(this.nodesSource, nodeData)
    this.graphBuilder.setData(this.connectionsSource, connectionsData)
    this.graphBuilder.updateGraph()
  }
}

/**
 * Creates the CompanyOwnership graph.
 */
export function initializeGraphManager<TEntity extends Entity, TConnection extends Connection>(
  graph: IGraph,
  setNodeInfos: Dispatch<SetStateAction<NodeRenderInfo<TEntity>[]>>,
  companyOwnershipModel: CompanyOwnershipModel,
  addNodeLabels: boolean
): GraphManager<TEntity, TConnection> {
  graph.clear()
  const graphManager = new GraphManager<TEntity, TConnection>()

  const graphBuilder = new GraphBuilder(graph)

  const edgesSource = graphBuilder.createEdgesSource<TConnection>(
    [],
    //id: data => data.id,
    'sourceId',
    'targetId'
  )

  const edgeCreator = edgesSource.edgeCreator

  edgeCreator.styleProvider = (edge: TConnection) => {
    if (graphManager.connectionStyleProvider) {
      const edgeStyle = graphManager.connectionStyleProvider({
        source: graphManager.nodeData.find(item => item.id === edge.sourceId)!,
        target: graphManager.nodeData.find(item => item.id === edge.targetId)!,
        connection: edge
      })
      if (edgeStyle) {
        return convertToPolylineEdgeStyle(edgeStyle)
      }
    }
    return edge.type === 'Relation' ? defaultRelationEdgeStyle : defaultOwnershipEdgeStyle
  }

  const labelBinding = edgeCreator.createLabelBinding()

  labelBinding.textProvider = dataItem =>
    getConnectionLabelText(companyOwnershipModel, dataItem, graphManager.connectionLabelProvider)
  labelBinding.styleProvider = dataItem =>
    getConnectionLabelStyle(companyOwnershipModel, dataItem, graphManager.connectionLabelProvider)

  labelBinding.addLabelUpdatedListener((_, evt) =>
    labelBinding.updateText(evt.graph, evt.item, evt.dataItem)
  )

  const nodesSource = graphBuilder.createNodesSource<TEntity>([], 'id')
  const nodeCreator = nodesSource.nodeCreator

  nodeCreator.styleProvider = dataItem => {
    if (graphManager.renderEntities) {
      return new ReactComponentHtmlNodeStyle(
        graphManager.renderEntities,
        setNodeInfos,
        (_ctx, node) => ({ ...node.tag })
      )
    }
    return getNodeStyle(dataItem)
  }

  if (addNodeLabels) {
    // adds the node labels if the shape node style is selected
    const nameLabelBinding = nodeCreator.createLabelBinding()

    nameLabelBinding.textProvider = dataItem =>
      getItemLabelText(companyOwnershipModel, dataItem, graphManager.itemLabelProvider)
    nameLabelBinding.styleProvider = dataItem =>
      getItemLabelStyle(companyOwnershipModel, dataItem, graphManager.itemLabelProvider)

    nameLabelBinding.addLabelUpdatedListener((_, evt) =>
      nameLabelBinding.updateText(evt.graph, evt.item, evt.dataItem)
    )
  }

  nodeCreator.layoutBindings.addBinding(
    'width',
    (item: TEntity) => item.width ?? getNode(item, graph)?.layout.width ?? undefined
  )
  nodeCreator.layoutBindings.addBinding(
    'height',
    (item: TEntity) => item.height ?? getNode(item, graph)?.layout.height ?? undefined
  )
  nodeCreator.layoutBindings.addBinding('x', (item: TEntity) => getNode(item, graph)?.layout.x ?? 0)
  nodeCreator.layoutBindings.addBinding('y', (item: TEntity) => getNode(item, graph)?.layout.y ?? 0)

  nodeCreator.addNodeUpdatedListener((_, evt) => {
    nodeCreator.updateLayout(evt.graph, evt.item, evt.dataItem)
    nodeCreator.updateStyle(evt.graph, evt.item, evt.dataItem)
    nodeCreator.updateTag(evt.graph, evt.item, evt.dataItem)
    nodeCreator.updateLabels(evt.graph, evt.item, evt.dataItem)
  })

  edgeCreator.addEdgeUpdatedListener((_, evt) => {
    edgeCreator.updateStyle(evt.graph, evt.item, evt.dataItem)
    edgeCreator.updateTag(evt.graph, evt.item, evt.dataItem)
    edgeCreator.updateLabels(evt.graph, evt.item, evt.dataItem)
  })

  graphManager.graphBuilder = graphBuilder
  graphManager.nodesSource = nodesSource
  graphManager.connectionsSource = edgesSource
  return graphManager
}

/**
 * Retrieves the CompanyOwnership item from an item's tag.
 */
export function geTEntity<TEntity extends Entity | Connection>(item: INode | IEdge): TEntity {
  return item.tag as TEntity
}

function compareData<T>(oldData: T[], newData: T[]): T[] {
  const unequalElements: T[] = []
  newData.forEach(obj2 => {
    const matchingObject = oldData.find(obj1 => JSON.stringify(obj1) === JSON.stringify(obj2))
    if (!matchingObject) {
      unequalElements.push(obj2)
    }
  })
  return unequalElements
}

export function convertToDefaultLabelStyle(
  label: SimpleLabel,
  cssClass: string
): DefaultLabelStyle {
  return new DefaultLabelStyle({
    textFill: 'currentColor',
    backgroundFill: 'currentColor',
    shape: label.labelShape ?? 'round-rectangle',
    cssClass: `${cssClass} ${label.className ?? ''}`,
    insets: 5
  })
}

function getConnectionLabelText<TConnection extends Connection>(
  companyOwnershipModel: CompanyOwnershipModel,
  connection: TConnection,
  connectionLabelProvider?: ConnectionLabelProvider<TConnection>
): string | null {
  if (connectionLabelProvider) {
    return connectionLabelProvider(connection, companyOwnershipModel)?.text ?? null
  }
  return null
}

function getConnectionLabelStyle<TConnection extends Connection>(
  companyOwnershipModel: CompanyOwnershipModel,
  connection: TConnection,
  connectionLabelProvider?: ConnectionLabelProvider<TConnection>
): DefaultLabelStyle | null {
  if (connectionLabelProvider) {
    const connectionLabel = connectionLabelProvider(connection, companyOwnershipModel)
    if (connectionLabel) {
      return convertToDefaultLabelStyle(connectionLabel, 'yfiles-react-connection-label')
    }
  }
  return null
}

function getItemLabelText<TEntity extends Entity>(
  companyOwnershipModel: CompanyOwnershipModel,
  item: TEntity,
  itemLabelProvider?: EntityLabelProvider<TEntity>
): string | null {
  if (itemLabelProvider) {
    return itemLabelProvider(item, companyOwnershipModel)?.text ?? null
  }
  return null
}

function getItemLabelStyle<TEntity extends Entity>(
  companyOwnershipModel: CompanyOwnershipModel,
  item: TEntity,
  itemLabelProvider?: EntityLabelProvider<TEntity>
): DefaultLabelStyle | null {
  if (itemLabelProvider) {
    const label = itemLabelProvider(item, companyOwnershipModel)
    if (label) {
      return convertToDefaultLabelStyle(label, 'yfiles-react-item-label')
    }
  }
  return null
}
