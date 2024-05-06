import {
  CompanyOwnership,
  CompanyOwnershipData,
  CompanyOwnershipProvider,
  DefaultContextMenuItems,
  Entity,
  RenderEntityProps,
  useCompanyOwnershipContext
} from '@yworks/react-yfiles-company-ownership'
import data from '../../data/company-data.json'
import './index.css'

function RenderEntity(props: RenderEntityProps<Entity>) {
  const {
    canHidePredecessors,
    canShowPredecessors,
    canHideSuccessors,
    canShowSuccessors,
    hidePredecessors,
    showPredecessors,
    hideSuccessors,
    showSuccessors
  } = useCompanyOwnershipContext()

  const item = props.dataItem as Entity & { currency?: string; jurisdiction: string }
  return (
    <div className="company-ownership-item">
      <div className="buttons-container">
        {canHidePredecessors(item) && (
          <button onClick={() => hidePredecessors(item)} title={'Hide Predecessors'}>
            -
          </button>
        )}
        {canShowPredecessors(item) && (
          <button onClick={() => showPredecessors(item)} title={'Show Predecessors'}>
            +
          </button>
        )}
      </div>

      <div className="company-ownership-item-content">
        <div className="type-text">{item.type}</div>
        <div className="name-text">{item.name}</div>
        <div className="details-text">
          {item.jurisdiction} {item.currency ? ' / ' + item.currency : ''}
        </div>
      </div>

      <div className="buttons-container">
        {canHideSuccessors(item) && (
          <button onClick={() => hideSuccessors(item)} title={'Hide Successors'}>
            -
          </button>
        )}
        {canShowSuccessors(item) && (
          <button onClick={() => showSuccessors(item)} title={'Show Successors'}>
            +
          </button>
        )}
      </div>
    </div>
  )
}

export default () => {
  return (
    <CompanyOwnershipProvider>
      <CompanyOwnership
        data={data as CompanyOwnershipData}
        contextMenuItems={DefaultContextMenuItems}
        renderEntity={RenderEntity}
      ></CompanyOwnership>
    </CompanyOwnershipProvider>
  )
}
