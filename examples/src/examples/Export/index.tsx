import {
  CompanyOwnership,
  CompanyOwnershipData,
  CompanyOwnershipProvider,
  useCompanyOwnershipContext
} from '@yworks/react-yfiles-company-ownership'
import data from '../../data/company-data.json'

/**
 * A company ownership component providing export and save to image functionalities.
 */
function CompanyOwnershipWrapper() {
  const { exportToSvg, exportToPng, print } = useCompanyOwnershipContext()

  return (
    <>
      <div className="toolbar">
        <button className="toolbar-button" onClick={async () => await print({ scale: 2 })}>
          Print
        </button>
        <button className="toolbar-button" onClick={async () => await exportToSvg({ scale: 2 })}>
          Export to SVG
        </button>
        <button className="toolbar-button" onClick={async () => await exportToPng({ scale: 2 })}>
          Export to PNG
        </button>
      </div>
      <CompanyOwnership data={data as CompanyOwnershipData}></CompanyOwnership>
    </>
  )
}

export default () => {
  return (
    <CompanyOwnershipProvider>
      <CompanyOwnershipWrapper></CompanyOwnershipWrapper>
    </CompanyOwnershipProvider>
  )
}
