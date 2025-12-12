import './index.css'

import {
  CompanyOwnership,
  CompanyOwnershipData,
  Entity,
  EntityType,
  Ownership,
  RenderEntityProps
} from '@yworks/react-yfiles-company-ownership'

import Flag from 'react-world-flags'

import Corporation from '@mui/icons-material/CorporateFare'
import Trust from '@mui/icons-material/AccountBalance'
import Partnership from '@mui/icons-material/Handshake'
import Individual from '@mui/icons-material/Person'
import Unknown from '@mui/icons-material/QuestionMark'
import ThirdParty from '@mui/icons-material/Groups'
import Disregarded from '@mui/icons-material/VisibilityOff'
import Multiple from '@mui/icons-material/Group'
import Branch from '@mui/icons-material/AccountTree'
import Cog from '@mui/icons-material/Settings'

import data from '../../data/company-data.json'
import { JSX } from 'react'

function getCountryCode(jurisdiction: string | undefined): string {
  switch (jurisdiction) {
    case 'US':
      return 'US'
    case 'UK':
      return 'GB'
    case 'Germany':
      return 'DE'
    case 'Spain':
      return 'ES'
    case 'Italy':
      return 'IT'
    case 'India':
      return 'IN'
    case 'Mexico':
      return 'MX'
    default:
      return 'DE'
  }
}

function FlagIcon(props: { jurisdiction: string | undefined }): JSX.Element {
  if (props.jurisdiction === 'UK/EU') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', gap: '5px', width: '100%' }}>
        <Flag code={'EU'} style={{ width: '30px' }}></Flag>
        <Flag code={'GB'} style={{ width: '30px' }}></Flag>
      </div>
    )
  }

  return <Flag code={getCountryCode(props.jurisdiction)} style={{ width: '30px' }}></Flag>
}

function CompanyIcon(props: { companyType: EntityType | undefined }): JSX.Element {
  switch (props.companyType) {
    case 'Trust':
      return <Trust></Trust>
    case 'Partnership':
      return <Partnership></Partnership>
    case 'Individual':
      return <Individual></Individual>
    case 'Third Party':
      return <ThirdParty></ThirdParty>
    case 'Disregarded':
      return <Disregarded></Disregarded>
    case 'Dual Resident':
    case 'Multiple':
      return <Multiple></Multiple>
    case 'Branch':
      return <Branch></Branch>
    case 'Corporation':
    case 'CTB':
    case 'RCTB':
      return <Corporation></Corporation>
    case 'PE_Risk':
    case 'Trapezoid':
      return <Cog></Cog>
    case 'Unknown':
    default:
      return <Unknown></Unknown>
  }
}

function RenderEntity(props: RenderEntityProps<Entity>) {
  const item = props.dataItem as Entity & { currency?: string; jurisdiction: string }
  return (
    <div className="company-ownership-item">
      {props.detail === 'high' ? (
        <div className="company-ownership-item-content">
          <div className="type-text">{item.type}</div>
          <div className="name-text">{item.name}</div>
          <div className="details-text">
            {item.jurisdiction} {item.currency ? ' / ' + item.currency : ''}
          </div>
          <div className="company-icon">
            <CompanyIcon companyType={item.type}></CompanyIcon>
          </div>
          <div className={item.type === 'Dual Resident' ? 'flag-icon-dual' : 'flag-icon'}>
            <FlagIcon jurisdiction={item.jurisdiction}></FlagIcon>
          </div>
        </div>
      ) : (
        <div className="company-ownership-item-content-low-detail">
          <div className="name-text-low-detail">{item.name}</div>
        </div>
      )}
    </div>
  )
}

export default () => (
  <CompanyOwnership
    data={data as CompanyOwnershipData}
    renderEntity={RenderEntity}
    itemSize={{ width: 200, height: 120 }}
    connectionLabelProvider={item => {
      return item.type === 'Ownership'
        ? {
            text: String((item as Ownership).ownership)
          }
        : undefined
    }}
  ></CompanyOwnership>
)
