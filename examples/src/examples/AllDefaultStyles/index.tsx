import { CompanyOwnership, CompanyOwnershipData } from '@yworks/react-yfiles-company-ownership'

const data: CompanyOwnershipData = {
  companies: [
    {
      id: 0,
      type: 'Bank',
      name: 'Bank'
    },
    {
      id: 1,
      type: 'Branch',
      name: 'Branch'
    },
    {
      id: 2,
      type: 'Corporation',
      name: 'Corporation'
    },
    {
      id: 3,
      type: 'CTB',
      name: 'CTB'
    },
    {
      id: 4,
      type: 'Disregarded',
      name: 'Disregarded'
    },
    {
      id: 5,
      type: 'Dual Resident',
      name: 'Dual Resident'
    },
    {
      id: 6,
      type: 'Individual',
      name: 'Individual'
    },
    {
      id: 7,
      type: 'Multiple',
      name: 'Multiple'
    },
    {
      id: 8,
      type: 'Partnership',
      name: 'Partnership'
    },
    {
      id: 9,
      type: 'PE_Risk',
      name: 'PE_Risk'
    },
    {
      id: 10,
      type: 'RCTB',
      name: 'RCTB'
    },
    {
      id: 11,
      type: 'Third Party',
      name: 'Third Party'
    },
    {
      id: 12,
      type: 'Trapezoid',
      name: 'Trapezoid'
    },
    {
      id: 13,
      type: 'Trust',
      name: 'Trust'
    },
    {
      id: 14,
      type: 'Unknown',
      name: 'Unknown'
    },
    {
      id: 15,
      type: 'Asset',
      name: 'Asset'
    },
    {
      id: 16,
      type: 'Octagon',
      name: 'Octagon'
    }
  ],
  connections: []
}

export default () => {
  return <CompanyOwnership data={data}></CompanyOwnership>
}
