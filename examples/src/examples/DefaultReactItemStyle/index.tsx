import {
  CompanyOwnership,
  CompanyOwnershipData,
  RenderEntity
} from '@yworks/react-yfiles-company-ownership'
import data from '../../data/company-data.json'

export default () => (
  <CompanyOwnership
    data={data as CompanyOwnershipData}
    renderEntity={RenderEntity}
  ></CompanyOwnership>
)
