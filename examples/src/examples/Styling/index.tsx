import {
  CompanyOwnership,
  CompanyOwnershipData,
  ConnectionStyleProvider,
  DefaultContextMenuItems,
  HighlightOptions,
  Ownership,
  RenderEntity
} from '@yworks/react-yfiles-company-ownership'
import data from '../../data/styled-company-data.json'
import './style.css'
import { useState } from 'react'
import { Connection, Entity } from '../../../../src'

export default () => {
  const [highlightOptions, setHighlightOptions] = useState<HighlightOptions>(() => ({
    selectionHighlightColor: 'red',
    selectionHighlightCssClass: 'entity-selected',
    hoverHighlightColor: 'blue',
    hoverHighlightCssClass: 'hover-class',
    neighborhoodHighlightColor: 'purple',
    neighborhoodHighlightCssClass: 'neighborhood-class'
  }))

  return (
    <>
      <button
        onClick={() => {
          setHighlightOptions({
            selectionHighlightColor: 'green',
            hoverHighlightColor: 'green',
            neighborhoodHighlightColor: 'green'
          })
        }}
      >
        Change Highlight Colors
      </button>
      <CompanyOwnership
        data={data as CompanyOwnershipData}
        renderEntity={RenderEntity}
        entityLabelProvider={item => {
          return {
            text: item.name ?? 'No Name',
            labelShape: 'rectangle',
            className: 'company-label'
          }
        }}
        connectionLabelProvider={item => {
          return item.type === 'Ownership'
            ? {
                text: String((item as Ownership).ownership),
                labelShape: 'hexagon',
                className: 'ownership-label'
              }
            : undefined
        }}
        connectionStyleProvider={
          (item => {
            return item.connection.type === 'Ownership'
              ? {
                  smoothingLength: 20,
                  thickness: 5,
                  targetArrow: {
                    type: 'ellipse',
                    color: '#002642'
                  },
                  className: 'ownership-connection'
                }
              : {
                  smoothingLength: 0,
                  thickness: 2,
                  targetArrow: {
                    type: 'cross',
                    color: '#E59500'
                  },
                  className: 'relation-connection'
                }
          }) as ConnectionStyleProvider<Entity, Connection>
        }
        contextMenuItems={DefaultContextMenuItems}
        highlightOptions={highlightOptions}
      ></CompanyOwnership>
    </>
  )
}
