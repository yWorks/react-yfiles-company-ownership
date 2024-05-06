import data from '../../data/company-data.json'
import {
  CompanyOwnership,
  CompanyOwnershipData,
  RenderTooltip
} from '@yworks/react-yfiles-company-ownership'

/**
 * An example App showcasing the tooltip functionality of the company ownership component.
 */

export default () => (
  <CompanyOwnership
    data={data as CompanyOwnershipData}
    renderTooltip={RenderTooltip}
  ></CompanyOwnership>
)
