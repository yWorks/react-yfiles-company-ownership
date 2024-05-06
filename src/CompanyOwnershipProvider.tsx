import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { useGraphComponent, withGraphComponentProvider } from '@yworks/react-yfiles-core'
import { CompanyOwnershipModel } from './CompanyOwnershipModel.ts'
import { ContentRectViewportLimiter } from './core/ContentRectViewportLimiter.ts'
import { DefaultGraph } from 'yfiles'
import { componentBackgroundColor, maximumZoom, minimumZoom } from './core/defaults.ts'
import { createCompanyOwnershipModel } from './CompanyOwnershipModelImpl.ts'
import { LayoutSupport } from './core/LayoutSupport.ts'
import { CompanyOwnership } from './CompanyOwnership.tsx'
import { CollapsibleTree } from './core/CollapsibleTree.ts'

const CompanyOwnershipContext = createContext<CompanyOwnershipModel | null>(null)

export function useCompanyOwnershipContextInternal(): CompanyOwnershipModel | null {
  return useContext(CompanyOwnershipContext)
}

/**
 * A hook that provides access to the {@link CompanyOwnershipModel} which has various functions that can
 * be used to interact with the {@link CompanyOwnership}.
 * It can only be used inside a {@link CompanyOwnership} component or a {@link CompanyOwnershipProvider}.
 *
 * @returns the {@link CompanyOwnershipModel} used in this context.
 *
 * ```tsx
 * function CompanyOwnershipWrapper() {
 *   const { fitContent, zoomTo } = useCompanyOwnershipContext()
 *
 *   return (
 *     <>
 *       <CompanyOwnership data={data} contextMenuItems={item => {
 *           if (item) {
 *             return [{ title: 'Zoom to Item', action: () => zoomTo([item]) }]
 *           }
 *           return []
 *         }}>
 *       </CompanyOwnership>
 *       <div style={{position: 'absolute', top: '20px', left: '20px'}}>
 *         <button onClick={() => fitContent()}>Fit Content</button>
 *       </div>
 *     </>
 *   )
 * }
 *
 * function CompanyOwnershipComponent () {
 *   return (
 *     <CompanyOwnershipProvider>
 *       <CompanyOwnershipWrapper></CompanyOwnershipWrapper>
 *     </CompanyOwnershipProvider>
 *   )
 * }
 * ```
 */
export function useCompanyOwnershipContext(): CompanyOwnershipModel {
  const context = useContext(CompanyOwnershipContext)
  if (context === null) {
    throw new Error(
      'This method can only be used inside a CompanyOwnership component or CompanyOwnershipProvider.'
    )
  }
  return context
}

/**
 * The CompanyOwnershipProvider component is a [context provider]{@link https://react.dev/learn/passing-data-deeply-with-context},
 * granting external access to the company ownership chart beyond the {@link CompanyOwnership} component itself.
 *
 * This functionality proves particularly valuable when there's a toolbar or sidebar housing elements that require
 * interaction with the company ownership chart. Examples would include buttons for zooming in and out or fitting the graph into the viewport.
 *
 * The snippet below illustrates how to leverage the CompanyOwnershipProvider, enabling a component featuring both a {@link CompanyOwnership}
 * and a sidebar to utilize the {@link useCompanyOwnershipContext} hook.
 *
 * ```tsx
 * function CompanyOwnershipWrapper() {
 *   const { fitContent, zoomTo } = useCompanyOwnershipContext()
 *
 *   return (
 *     <>
 *       <CompanyOwnership data={data} contextMenuItems={item => {
 *           if (item) {
 *             return [{ title: 'Zoom to Item', action: () => zoomTo([item]) }]
 *           }
 *           return []
 *         }}>
 *       </CompanyOwnership>
 *       <div style={{position: 'absolute', top: '20px', left: '20px'}}>
 *         <button onClick={() => fitContent()}>Fit Content</button>
 *       </div>
 *     </>
 *   )
 * }
 *
 * function CompanyOwnershipComponent () {
 *   return (
 *     <CompanyOwnershipProvider>
 *       <CompanyOwnershipWrapper></CompanyOwnershipWrapper>
 *     </CompanyOwnershipProvider>
 *   )
 * }
 * ```
 */
export const CompanyOwnershipProvider = withGraphComponentProvider(
  ({ children }: PropsWithChildren) => {
    const graphComponent = useGraphComponent()

    if (!graphComponent) {
      return children
    }

    const CompanyOwnership = useMemo(() => {
      const fullGraph = new DefaultGraph()
      graphComponent.div.style.backgroundColor = componentBackgroundColor

      graphComponent.viewportLimiter = new ContentRectViewportLimiter()
      graphComponent.maximumZoom = maximumZoom
      graphComponent.minimumZoom = minimumZoom

      const layoutSupport = new LayoutSupport(graphComponent)
      const collapsibleTree = new CollapsibleTree(graphComponent, fullGraph, layoutSupport)
      graphComponent.graph = collapsibleTree.filteredGraph
      return createCompanyOwnershipModel(graphComponent, collapsibleTree, layoutSupport)
    }, [])

    return (
      <CompanyOwnershipContext.Provider value={CompanyOwnership}>
        {children}
      </CompanyOwnershipContext.Provider>
    )
  }
)
