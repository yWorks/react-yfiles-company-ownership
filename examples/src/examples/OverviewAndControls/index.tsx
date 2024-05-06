import {
  CompanyOwnership,
  CompanyOwnershipData,
  Controls,
  DefaultControlButtons,
  Overview
} from '@yworks/react-yfiles-company-ownership'
import data from '../../data/company-data.json'

export default () => {
  return (
    <CompanyOwnership data={data as CompanyOwnershipData}>
      <Overview></Overview>
      <Controls buttons={DefaultControlButtons}></Controls>
    </CompanyOwnership>
  )
}
