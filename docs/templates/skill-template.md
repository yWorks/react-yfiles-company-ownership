---
name: react-yfiles-company-ownership

description: Use this skill when working with the yFiles React Company Ownership component in a React application. This includes creating, integrating, configuring, troubleshooting, or extending company ownership charts, entities, ownership relationships, custom rendering, context menus, selection, search, zooming, layout, filtering, or export, including requests that do not mention yFiles or the package name explicitly.
---

# yFiles React Company Ownership

Use `@yworks/react-yfiles-company-ownership` with company ownership data containing entities and their ownership connections. Ensure the yFiles license is registered, the stylesheet is imported, and the component API is used correctly.

## Data preparation

Convert source data to these shapes before passing it to `CompanyOwnership`:

```ts
type EntityId = string | number

type Entity = {
    id: EntityId // unique identifier for the entity
    type?:
      | 'Asset' | 'Bank' | 'Branch' | 'CTB' | 'Corporation'
      | 'Disregarded' | 'Dual Resident' | 'Individual' | 'Multiple'
      | 'Octagon' | 'PE_Risk' | 'Partnership' | 'RCTB'
      | 'Third Party' | 'Trapezoid' | 'Trust' | 'Unknown'
    width?: number // item width
    height?: number // item height
    name?: string // displayed entity name
    className?: string // CSS class name for the item
    style?: React.CSSProperties // inline style for the item
}

type Connection = {
    sourceId: EntityId // identifier of the source entity
    targetId: EntityId // identifier of the target entity
    type?: 'Ownership' | 'Relation' // default visualization of the connection
}

type CompanyOwnershipData<TEntity extends Entity, TConnection extends Connection> = {
    companies: TEntity[]
    connections: TConnection[]
}
```

Every connection must refer to an entity in `companies`. Use `type: 'Ownership'` for an ownership link and `type: 'Relation'` for a general relationship. Extend `Entity` or `Connection` with application-specific fields when needed for custom renderers, labels, tooltips, or search.

## Minimal react example

Register the license and import the stylesheet; both are required.

```tsx
import {
    CompanyOwnership,
    registerLicense,
    type CompanyOwnershipData,
    type Entity
} from '@yworks/react-yfiles-company-ownership'

import '@yworks/react-yfiles-company-ownership/dist/index.css'
import yFilesLicense from '<yFiles package path>/lib/license.json'

registerLicense(yFilesLicense)

type Company = Entity & {
    name: string
}

type CompanyConnection = Connection & {
    ownershipPercentage?: number
}

const data: CompanyOwnershipData<Company, CompanyConnection> = {
    companies: [
        { id: 'holding', name: 'Example Holdings', type: 'Corporation' },
        { id: 'subsidiary', name: 'Example Manufacturing', type: 'Corporation' }
    ],
    connections: [
        { sourceId: 'holding', targetId: 'subsidiary', type: 'Ownership', ownershipPercentage: 100 }
    ]
}

export default function App() {
    return <CompanyOwnership data={data} />
}
```

Replace `data` with suitable application data and `<yFiles package path>` with the actual downloaded package directory.

## References

- Use the [component feature overview](references/features.md) to choose appropriate capabilities.
- Use the [complete API documentation](references/api.md) for exact props, types, and configuration.