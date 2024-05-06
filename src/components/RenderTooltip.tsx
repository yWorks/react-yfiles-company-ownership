import '../styles/company-ownership-tooltip.css'
import { Connection, Entity } from '../CompanyOwnership.tsx'
import { getUserProperties, stringifyData } from './template-utils.ts'
import { RenderTooltipProps } from '@yworks/react-yfiles-core'
import { Fragment } from 'react'
import { useCompanyOwnershipContext } from '../CompanyOwnershipProvider.tsx'

/**
 * A default template for the company ownership's tooltip that shows the `name` or `id` property of the data item
 * and a data-grid of the properties.
 *
 * ```tsx
 * function CompanyOwnershipComponent() {
 *   return (
 *     <CompanyOwnership data={data} renderTooltip={RenderCompanyOwnershipTooltip}></CompanyOwnership>
 *   )
 * }
 * ```
 *
 * @param data - The data item to show the tooltip for.
 */
export function RenderTooltip<TEntity extends Entity, TConnection extends Connection>({
  data
}: RenderTooltipProps<TEntity | TConnection>) {
  const context = useCompanyOwnershipContext()!

  if (!data) {
    return null
  }

  let title = ''
  if (context.isConnection(data)) {
    title = `${data.sourceId} -> ${data.targetId}`
  } else {
    title = data.name ?? String(data.id)
  }

  const properties = getUserProperties(data)
  return (
    <div className="yfiles-react-tooltip">
      {title && <div className="yfiles-react-tooltip__name">{stringifyData(title)}</div>}
      <div className="yfiles-react-tooltip__data-grid">
        {Object.entries(properties).map(([property, value], i) => (
          <Fragment key={i}>
            <div className="yfiles-react-tooltip__data-grid--key">{property}</div>
            <div className="yfiles-react-tooltip__data-grid--value">{stringifyData(value)}</div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
