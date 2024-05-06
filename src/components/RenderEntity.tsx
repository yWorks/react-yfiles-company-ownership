import { UserEntity, Entity, CompanyOwnership } from '../CompanyOwnership.tsx'
import {
  getUserProperties,
  getHighlightClasses,
  stringifyData,
  getNodeClass
} from './template-utils.ts'
import { RenderNodeProps as RenderEntityProps } from '@yworks/react-yfiles-core'
import { Fragment } from 'react'

/**
 * A default component that visualizes entities in the company ownership diagram.
 * The detail view displays a data grid of all available properties
 * on the entity. The overview visualization only shows the entities `name` or `id`.
 * The component can be adjusted for each entity individually or for all entities at
 * once by setting {@link Entity.className} or {@link Entity.style} in the
 * data.
 *
 * The component is used as the default visualization if no `renderEntity` prop is specified on {@link CompanyOwnership}.
 * However, it can be integrated in another component, for example, to have different styles for different items.
 *
 * ```tsx
 * function CompanyOwnershipComponent() {
 *     const MyCompanyOwnershipItem = useMemo(
 *       () => (props: RenderEntityProps<CompanyOwnershipItem>) => {
 *         const { dataItem } = props
 *         if (dataItem?.name?.includes('Plate')) {
 *           return (
 *             <>
 *               <div
 *                 style={{
 *                   backgroundColor: 'lightblue',
 *                   width: '100%',
 *                   height: '100%'
 *                 }}
 *               >
 *                 <div>{dataItem.name}</div>
 *               </div>
 *             </>
 *           )
 *         } else {
 *           return <RenderEntity {...props}></RenderEntity>
 *         }
 *       },
 *       []
 *     )
 *
 *     return (
 *       <CompanyOwnership data={data} renderEntity={MyCompanyOwnershipItem}></CompanyOwnership>
 *     )
 *   }
 * ```
 */
export function RenderEntity<TEntity extends Entity>({
  dataItem,
  detail,
  hovered,
  focused,
  selected
}: RenderEntityProps<TEntity>) {
  const customCompanyOwnershipItem = dataItem as UserEntity
  const properties = getUserProperties(customCompanyOwnershipItem)
  const companyType = customCompanyOwnershipItem.type ?? 'Unknown'
  const style = {
    ...customCompanyOwnershipItem.style,
    ...{
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }
  }

  return (
    <>
      <div
        style={style}
        className={`yfiles-react-node ${getNodeClass(detail)} ${getHighlightClasses(
          selected,
          hovered,
          focused
        )} company-node-${companyType.toLowerCase()}
        ${customCompanyOwnershipItem.className ?? ''}`.trim()}
      >
        {detail === 'high' ? (
          <div className="yfiles-react-detail-node__content">
            {
              <div className="yfiles-react-detail-node__name">
                {customCompanyOwnershipItem.name ?? `ID: ${customCompanyOwnershipItem.id}`}
              </div>
            }
            <div className="yfiles-react-detail-node__data-grid">
              {Object.entries(properties).map(([property, value], i) => (
                <Fragment key={i}>
                  <div className="yfiles-react-detail-node__data-grid--key">{property}</div>
                  <div className="yfiles-react-detail-node__data-grid--value">
                    {stringifyData(value)}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="yfiles-react-overview-node__content">
            {customCompanyOwnershipItem.name ?? `ID: ${customCompanyOwnershipItem.id}`}
          </div>
        )}
      </div>
    </>
  )
}
