import {
  CompanyOwnership,
  CompanyOwnershipData,
  CompanyOwnershipProvider,
  Connection,
  Entity,
  useCompanyOwnershipContext
} from '@yworks/react-yfiles-company-ownership'
import { KeyboardEvent, useState } from 'react'
import data from '../../data/company-data.json'

function MyCompanyOwnershipComponent() {
  const companyOwnershipModel = useCompanyOwnershipContext()
  const [searchQuery, setSearchQuery] = useState('')
  const onSearchEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      companyOwnershipModel.zoomTo(companyOwnershipModel.getSearchHits())
    }
  }
  return (
    <>
      <CompanyOwnership
        data={data as CompanyOwnershipData}
        searchNeedle={searchQuery}
        onSearch={(data: Entity | Connection, searchQuery: string) => {
          return 'name' in data
            ? (data.name!.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
            : false
        }}
      ></CompanyOwnership>
      <input
        className="search"
        type={'search'}
        placeholder="Search..."
        style={{
          width: '200px',
          position: 'absolute',
          top: '50px',
          left: 'calc(50% - 100px)'
        }}
        onChange={event => {
          setSearchQuery(event.target.value)
        }}
        onKeyDown={onSearchEnter}
      ></input>
    </>
  )
}

/**
 * An example App showcasing the search functionality of the company ownership component.
 */
export default () => (
  <CompanyOwnershipProvider>
    <MyCompanyOwnershipComponent></MyCompanyOwnershipComponent>
  </CompanyOwnershipProvider>
)
