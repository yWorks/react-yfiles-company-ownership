import { CompanyOwnership, CompanyOwnershipData } from '@yworks/react-yfiles-company-ownership'
import data from '../../data/company-data.json'

export default () => {
  return <CompanyOwnership data={data as CompanyOwnershipData}></CompanyOwnership>
}
