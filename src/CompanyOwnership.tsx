import './styles/company-ownership-styles.css'
import './styles/company-ownership-nodes.css'
import {
  ComponentType,
  CSSProperties,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  BridgeCrossingStyle,
  BridgeManager,
  GraphComponent,
  GraphObstacleProvider,
  GraphViewerInputMode,
  IGraph,
  NodeInsetsProvider,
  Size
} from 'yfiles'
import {
  initializeFocus,
  initializeHighlights,
  initializeHover,
  initializeInputMode,
  initializeSelection
} from './core/input'
import {
  checkLicense,
  checkStylesheetLoaded,
  ContextMenu,
  ContextMenuItemProvider,
  EdgeStyle as ConnectionStyle,
  LicenseError,
  NodeRenderInfo,
  ReactComponentHtmlNodeStyle,
  ReactNodeRendering,
  RenderContextMenuProps,
  RenderNodeProps as RenderEntityProps,
  RenderTooltipProps,
  Tooltip,
  useGraphSearch,
  useReactNodeRendering,
  withGraphComponent
} from '@yworks/react-yfiles-core'
import {
  CompanyOwnershipProvider,
  useCompanyOwnershipContext,
  useCompanyOwnershipContextInternal
} from './CompanyOwnershipProvider.tsx'
import { initializeGraphManager } from './core/data-loading.ts'
import { CompanyOwnershipModel, CompanyOwnershipModelInternal } from './CompanyOwnershipModel.ts'
import { RenderEntity } from './components/RenderEntity.tsx'
import {
  defaultGraphFitInsets,
  defaultLayoutOptions,
  defaultOwnershipEdgeStyle
} from './core/defaults.ts'
import { configureIndicatorStyling } from './core/configure-highlight-indicators.ts'
import {
  getNeighborhoodIndicatorManager,
  registerNeighborHoodIndicatorManager
} from './core/NeighborhoodIndicatorManager.ts'

/**
 * The item's unique id.
 */
export type EntityId = string | number

/**
 * The basic actor in a company ownership chart. This could be (among others) a company, a bank, or
 * an individual. See the {@link EntityType} for the available types.
 */
export interface Entity {
  /**
   * The item's unique id.
   */
  id: EntityId

  /**
   * The entity's optional type.
   * The type determines the color and shape of an entity in the default visualization.
   */
  type?: EntityType
  /**
   * The optional render width of this item. If the width is not specified, it is determined by measuring the
   * item visualization unless a default size is defined by {@link CompanyOwnershipProps.nodeSize}.
   */
  width?: number
  /**
   * The optional render height of this item. If the height is not specified, it is determined by measuring the
   * item visualization unless a default size is defined by {@link CompanyOwnershipProps.nodeSize}.
   */
  height?: number
  /**
   * An optional name of the entity. The default visualization renders the name as a label on the entity.
   */
  name?: string
  /**
   * The optional CSS class name that can be accessed in a custom component that renders the item.
   */
  className?: string
  /**
   * The optional CSS style that can be accessed in a custom component that renders the item.
   */
  style?: CSSProperties
}

/**
 * The basic data type for the connections between entities visualized by the {@link CompanyOwnership} component.
 */
export interface Connection {
  /**
   * The id of the connection source entity
   */
  sourceId: EntityId
  /**
   * The id of the connection target entity
   */
  targetId: EntityId
  /**
   * The optional type of the connection.
   * The type determines the default visualization of the connection.
   */
  type?: ConnectionType
}

/**
 * A connection representing an ownership relation.
 */
export interface Ownership extends Connection {
  type: 'Ownership'
  ownership?: number
}

/**
 * The various types an entity can have.
 * Every type is mapped to a default node visualization.
 */
export type EntityType =
  | 'Asset'
  | 'Bank'
  | 'Branch'
  | 'CTB'
  | 'Corporation'
  | 'Disregarded'
  | 'Dual Resident'
  | 'Individual'
  | 'Multiple'
  | 'Octagon'
  | 'PE_Risk'
  | 'Partnership'
  | 'RCTB'
  | 'Third Party'
  | 'Trapezoid'
  | 'Trust'
  | 'Unknown'

/**
 * A connection can either be a simple "Relation" or an "Ownership" connection, which additionally
 * has a numerical ownership property.
 */
export type ConnectionType = 'Ownership' | 'Relation'

/**
 * A data type that combines custom data props with the {@link Entity}. Data needs to fit in
 * this type so the component can handle the structure of the company ownership chart correctly.
 */
export type UserEntity<TCustomProps = Record<string, unknown>> = TCustomProps & Entity

/**
 * A data type that combines custom data props with the {@link Connection}. Data needs to fit in
 * this type so the component can handle the structure of the company ownership chart correctly.
 */
export type UserConnection<TCustomProps = Record<string, unknown>> = TCustomProps & Connection

/**
 * A function type that provides connection styles for company ownership links.
 *
 * The connection property is the {@link Connection}, the source and target properties
 * represent the start and end {@link Entity} of the connection, respectively.
 */
export type ConnectionStyleProvider<
  TEntity extends Entity = Entity,
  TConnection extends Connection = Connection
> = (data: {
  source: TEntity
  target: TEntity
  connection: TConnection
}) => ConnectionStyle | undefined

/**
 * A callback type invoked when an item has been focused.
 */
export type ItemFocusedListener<TEntity extends Entity | Connection> = (
  item: TEntity | null
) => void

/**
 * A callback type invoked when an item has been selected or deselected.
 */
export type ItemSelectedListener<TEntity extends Entity | Connection> = (
  selectedItems: TEntity[]
) => void

/**
 * A callback type invoked when the hovered item has changed.
 */
export type ItemHoveredListener<TEntity extends Entity | Connection> = (
  item: TEntity | null,
  oldItem?: TEntity | null
) => void

/**
 * A function that returns whether the given item matches the search needle.
 */
export type SearchFunction<TEntity extends Entity | Connection, TNeedle = string> = (
  item: TEntity,
  needle: TNeedle
) => boolean

/**
 * A simple label description.
 */
export type SimpleLabel = {
  /**
   * The CSS class name to be used for the label.
   */
  className?: string
  /**
   * The text to be displayed on the label.
   */
  text: string
  /**
   * The basic shape of the label. The default is 'round-rectangle'.
   */
  labelShape?: 'hexagon' | 'pill' | 'rectangle' | 'round-rectangle'
}

/**
 * A function that provides text to display as a label on a connection.
 */
export type ConnectionLabelProvider<TConnection extends Connection> = (
  item: TConnection,
  companyOwnershipModel: CompanyOwnershipModel
) => SimpleLabel | undefined

/**
 * A function that provides text to display as a label on an entity.
 */
export type EntityLabelProvider<TEntity extends Entity> = (
  item: TEntity,
  companyOwnershipModel: CompanyOwnershipModel
) => SimpleLabel | undefined

/**
 * The company ownership data consisting of {@link Entity}s and {@link Connection}s.
 */
export type CompanyOwnershipData<
  TEntity extends Entity = Entity,
  TConnection extends Connection = Connection
> = {
  companies: TEntity[]
  connections: TConnection[]
}

/**
 * Configures the direction of the flow for the layout.
 */
export type LayoutDirection = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top'

/**
 * Style describing the visual representation of an edge in the graph.
 * See {@link https://docs.yworks.com/yfileshtml/#/api/HierarchicLayoutEdgeRoutingStyle}
 */
export type EdgeRoutingStyle = 'orthogonal' | 'curved' | 'octilinear' | 'polyline'

/**
 * Configuration options for the Company Ownership diagram layout.
 */
export interface LayoutOptions {
  /**
   * The direction for the flow in the graph.
   */
  direction?: LayoutDirection
  /**
   * The style edges are routed in.
   */
  routingStyle?: EdgeRoutingStyle
  /**
   * The minimum distance between the layers in the hierarchy.
   */
  minimumLayerDistance?: number
  /**
   * The minimum length for the first segment of an edge.
   */
  minimumFirstSegmentLength?: number
  /**
   * The minimum length for the last segment of an edge.
   */
  minimumLastSegmentLength?: number
  /**
   * Limits the time the layout algorithm can use to the provided number of milliseconds.
   * This is an expert option. The main application is for graphs with many edges, where usually
   * the part of the layout calculations that takes the longest time is the edge routing.
   */
  maximumDuration?: number
}

/**
 * The props for the {@link CompanyOwnership} component.
 */
export interface CompanyOwnershipProps<
  TEntity extends Entity,
  TConnection extends Connection,
  TNeedle
> {
  /**
   * The data items visualized by the company ownership.
   */
  data: CompanyOwnershipData<TEntity, TConnection>
  /**
   * An optional callback that's called when an item is focused.
   *
   * Note that the focused item is not changed if the empty canvas is clicked.
   */
  onItemFocus?: ItemFocusedListener<TEntity | TConnection>
  /**
   * An optional callback that's called when an item is selected or deselected.
   */
  onItemSelect?: ItemSelectedListener<TEntity | TConnection>
  /**
   * An optional callback that's called when the hovered item has changed.
   */
  onItemHover?: ItemHoveredListener<TEntity | TConnection>
  /**
   * A string or a complex object to search for.
   *
   * The default search implementation can only handle strings and searches on the properties of the
   * data item. For more complex search logic, provide an {@link CompanyOwnership.onSearch} callback.
   */
  searchNeedle?: TNeedle
  /**
   * An optional callback that returns whether the given item matches the search needle.
   *
   * The default search implementation only supports string needles and searches all properties of the data item.
   * Provide this callback to implement custom search logic.
   */
  onSearch?: SearchFunction<TEntity | TConnection, TNeedle>
  /**
   * A custom render component used for rendering the given data item.
   */
  renderEntity?: ComponentType<RenderEntityProps<TEntity>>
  /**
   * A function that provides a style configuration for the given connection.
   */
  connectionStyleProvider?: ConnectionStyleProvider<TEntity, TConnection>
  /**
   * Specifies the CSS class used for the {@link CompanyOwnership} component.
   */
  className?: string
  /**
   * Specifies the CSS style used for the {@link CompanyOwnership} component.
   */
  style?: CSSProperties
  /**
   * Specifies the default item size used when no explicit width and height are provided.
   */
  itemSize?: { width: number; height: number }
  /**
   * An optional component that can be used for rendering a custom tooltip.
   */
  renderTooltip?: ComponentType<RenderTooltipProps<TEntity | TConnection>>
  /**
   * An optional function specifying the context menu items for a data item.
   */
  contextMenuItems?: ContextMenuItemProvider<TEntity | TConnection>
  /**
   * An optional component that renders a custom context menu.
   */
  renderContextMenu?: ComponentType<RenderContextMenuProps<TEntity>>

  /**
   * Options for configuring the layout style and behavior.
   */
  layoutOptions?: LayoutOptions

  /**
   * State setter used to indicate whether the layout is running.
   */
  setLayoutRunning?: React.Dispatch<React.SetStateAction<boolean>>

  /**
   * Provides a label description for connections.
   */
  connectionLabelProvider?: ConnectionLabelProvider<TConnection>

  /**
   * Provides a label description for entities.
   * The label is not added if renderEntity is set.
   */
  entityLabelProvider?: EntityLabelProvider<TEntity>

  /**
   * Optional Web Worker to run the layout calculation.
   * This requires the initialization of a Web Worker, see {@link initializeWebWorker}.
   */
  layoutWorker?: Worker

  /**
   * Sets the styling options for the different highlight indicators.
   */
  highlightOptions?: HighlightOptions
}

/**
 * Configuration options for styling the hover, selection and neighborhood highlight
 */
export type HighlightOptions = {
  /**
   * The stroke color of the neighborhood highlight
   */
  neighborhoodHighlightColor?: string
  /**
   * A CSS class that can be used to style the neighborhood highlight
   */
  neighborhoodHighlightCssClass?: string
  /**
   * The stroke color of the hover highlight
   */
  hoverHighlightColor?: string
  /**
   * A CSS class that can be used to style the hover highlight
   */
  hoverHighlightCssClass?: string
  /**
   * The stroke color of the selection highlight
   */
  selectionHighlightColor?: string
  /**
   * A CSS class that can be used to style the selection highlight
   */
  selectionHighlightCssClass?: string
}

const licenseErrorCodeSample = `import {CompanyOwnership, registerLicense} from '@yworks/react-yfiles-company-ownership' 
import '@yworks/react-yfiles-company-ownership/dist/index.css'
import yFilesLicense from './license.json'

function App() {
  registerLicense(yFilesLicense)
            
  const data = {
    "companies": [
      { "id": 0, "name": "Big Data Group" },
      { "id": 1, "name": "Investment Capital" }
    ],
    "connections": [
      { "sourceId": 0, "targetId": 1 }
    ]
  }

  return <CompanyOwnership data={data}></CompanyOwnership>
}`

/**
 * The CompanyOwnership component visualizes the given data as a company ownership chart.
 * All data items have to be included in the [data]{@link CompanyOwnershipProps.data}.
 *
 * ```tsx
 * function CompanyOwnershipChart() {
 *   return (
 *     <CompanyOwnership data={data}> </CompanyOwnership>
 *   )
 * }
 * ```
 */
export function CompanyOwnership<
  TEntity extends Entity = UserEntity,
  TConnection extends Connection = UserConnection,
  TNeedle = string
>(props: CompanyOwnershipProps<TEntity, TConnection, TNeedle> & PropsWithChildren) {
  if (!checkLicense()) {
    return (
      <LicenseError
        componentName={'yFiles React Company Ownership Component'}
        codeSample={licenseErrorCodeSample}
      />
    )
  }

  const isWrapped = useCompanyOwnershipContextInternal()
  if (isWrapped) {
    return <CompanyOwnershipCore {...props}>{props.children}</CompanyOwnershipCore>
  }

  return (
    <CompanyOwnershipProvider>
      <CompanyOwnershipCore {...props}>{props.children}</CompanyOwnershipCore>
    </CompanyOwnershipProvider>
  )
}

const CompanyOwnershipCore = withGraphComponent(
  <TEntity extends Entity, TConnection extends Connection, TNeedle>({
    children,
    renderEntity,
    connectionStyleProvider,
    onItemHover,
    onSearch,
    onItemFocus,
    onItemSelect,
    data,
    searchNeedle,
    itemSize,
    renderTooltip,
    contextMenuItems,
    renderContextMenu,
    setLayoutRunning,
    layoutOptions,
    connectionLabelProvider,
    entityLabelProvider,
    layoutWorker,
    highlightOptions
  }: CompanyOwnershipProps<TEntity, TConnection, TNeedle> & PropsWithChildren) => {
    const companyOwnershipModel = useCompanyOwnershipContext() as CompanyOwnershipModelInternal

    const graphComponent = companyOwnershipModel.graphComponent

    useEffect(() => {
      checkStylesheetLoaded(graphComponent.div, 'react-yfiles-company-ownership')
    }, [])

    useEffect(() => {
      const layoutSupport = companyOwnershipModel.layoutSupport
      if (layoutSupport) {
        layoutSupport.layoutOptions = layoutOptions ?? defaultLayoutOptions
        layoutSupport.setLayoutRunning = setLayoutRunning
        layoutSupport.layoutWorker = layoutWorker
      }
    }, [graphComponent, layoutOptions, setLayoutRunning, layoutWorker])

    const { nodeInfos, setNodeInfos } = useReactNodeRendering<TEntity>()

    const { graphManager } = useMemo(() => {
      const graph = graphComponent.graph

      initializeDefaultStyle(graph, setNodeInfos, itemSize)
      initializeBridges(graphComponent)

      graphComponent.graph.decorator.nodeDecorator.insetsProviderDecorator.setFactory(node => {
        return graphComponent.graph.isGroupNode(node)
          ? new NodeInsetsProvider([50, 15, 15, 15])
          : null
      })

      // populate the graph with the sample data and set default styles
      const graphManager = initializeGraphManager<TEntity, TConnection>(
        graph,
        setNodeInfos,
        companyOwnershipModel,
        renderEntity === undefined
      )

      // initializes basic interaction with the graph including the properties panel
      initializeInputMode(graphComponent, companyOwnershipModel)
      initializeHighlights(graphComponent)
      registerNeighborHoodIndicatorManager(graphComponent, highlightOptions)

      return {
        graphManager
      }
    }, [])

    useEffect(() => {
      // initializes basic interaction with the graph including the properties panel
      configureIndicatorStyling(graphComponent, highlightOptions)
      getNeighborhoodIndicatorManager(graphComponent).update(highlightOptions)
    }, [highlightOptions])

    useEffect(() => {
      initializeDefaultStyle(graphComponent.graph, setNodeInfos, itemSize)
    }, [data, itemSize, connectionStyleProvider, renderEntity])

    useEffect(() => {
      const hoverItemChangedListener = initializeHover(onItemHover, graphComponent)

      return () => {
        // clean up
        hoverItemChangedListener &&
          (
            graphComponent.inputMode as GraphViewerInputMode
          ).itemHoverInputMode.removeHoveredItemChangedListener(hoverItemChangedListener)
      }
    }, [onItemHover])

    useEffect(() => {
      // initialize the focus and selection to display the information of the selected element
      const currentItemChangedListener = initializeFocus(onItemFocus, graphComponent)
      const selectedItemChangedListener = initializeSelection(onItemSelect, graphComponent)

      return () => {
        // clean up the listeners
        currentItemChangedListener &&
          graphComponent.removeCurrentItemChangedListener(currentItemChangedListener)
        selectedItemChangedListener &&
          graphComponent.selection.removeItemSelectionChangedListener(selectedItemChangedListener)
      }
    }, [onItemFocus, onItemSelect])

    useEffect(() => {
      graphManager.updateGraph(
        data,
        renderEntity,
        connectionStyleProvider,
        connectionLabelProvider,
        entityLabelProvider
      )
    }, [data, itemSize?.width, itemSize?.height, connectionStyleProvider, renderEntity])

    useEffect(() => {
      graphComponent.fitGraphBounds(defaultGraphFitInsets)
    }, [])

    const graphSearch = useGraphSearch<TEntity, TNeedle>(graphComponent, searchNeedle, onSearch)
    // provide search hits on the companyOwnershipModel
    companyOwnershipModel.getSearchHits = () => graphSearch.matchingNodes.map(n => n.tag)

    const maxNodeSize = useMemo(() => ({ width: 400, height: Number.POSITIVE_INFINITY }), [])

    useEffect(() => {
      companyOwnershipModel.hasReactItems = nodeInfos.length > 0
    }, [nodeInfos])

    const [measureTrigger, setMeasureTrigger] = useState<boolean>(false)

    useEffect(() => {
      setMeasureTrigger(oldValue => !oldValue)
    }, [renderEntity, data])

    return (
      <>
        <ReactNodeRendering
          nodeData={data.companies}
          nodeInfos={nodeInfos}
          nodeSize={itemSize}
          maxSize={maxNodeSize}
          onMeasured={() => {
            // showLevel already runs a layout, so only layout if not defined
            companyOwnershipModel.applyLayout(false, [], undefined, true)
          }}
          onRendered={companyOwnershipModel.onRendered}
          measureTrigger={measureTrigger}
        />
        {renderTooltip && <Tooltip renderTooltip={renderTooltip}></Tooltip>}
        {(contextMenuItems || renderContextMenu) && (
          <ContextMenu menuItems={contextMenuItems} renderMenu={renderContextMenu}></ContextMenu>
        )}
        {children}
      </>
    )
  }
)

/**
 * Sets style defaults for nodes and edges.
 */
function initializeDefaultStyle<TEntity extends Entity>(
  graph: IGraph,
  setNodeInfos: Dispatch<SetStateAction<NodeRenderInfo<TEntity>[]>>,
  nodeSize?: { width: number; height: number }
): void {
  graph.nodeDefaults.style = new ReactComponentHtmlNodeStyle<TEntity>(
    RenderEntity,
    setNodeInfos,
    (_ctx, node) => ({ ...node.tag })
  )

  if (nodeSize) {
    graph.nodeDefaults.size = new Size(nodeSize.width, nodeSize.height)
  } else {
    graph.nodeDefaults.size = new Size(120, 60)
  }

  graph.edgeDefaults.style = defaultOwnershipEdgeStyle
}

function initializeBridges(graphComponent: GraphComponent) {
  // Configure bridge manager: This visualizes edge crossings in a way that makes
  // it much easier to understand which edge goes where.
  const bridgeManager = new BridgeManager({
    defaultBridgeCrossingStyle: BridgeCrossingStyle.GAP
  })
  bridgeManager.canvasComponent = graphComponent
  bridgeManager.addObstacleProvider(new GraphObstacleProvider())
}
