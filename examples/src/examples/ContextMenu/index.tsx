import {
  CompanyOwnership,
  CompanyOwnershipData,
  DefaultContextMenuItems,
  Ownership
} from '@yworks/react-yfiles-company-ownership'
import data from '../../data/company-data.json'

export default () => {
  return (
    <CompanyOwnership
      data={data as CompanyOwnershipData}
      connectionLabelProvider={item => {
        return item.type === 'Ownership'
          ? {
              text: String((item as Ownership).ownership)
            }
          : undefined
      }}
      contextMenuItems={DefaultContextMenuItems}
    ></CompanyOwnership>
  )
}
