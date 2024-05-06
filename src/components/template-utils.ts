import { Connection, Entity } from '../CompanyOwnership.tsx'

export function stringifyData(data: any): string {
  return typeof data === 'object' ? JSON.stringify(data) : String(data)
}

export function getNodeClass(level: 'high' | 'low') {
  return level === 'high' ? 'yfiles-react-detail-node' : 'yfiles-react-overview-node'
}

export function getHighlightClasses(selected: boolean, hovered: boolean, focused: boolean): string {
  const highlights = ['yfiles-react-node-highlight']
  if (focused) {
    highlights.push('yfiles-react-node-highlight--focused')
  }
  if (hovered) {
    highlights.push('yfiles-react-node-highlight--hovered')
  }
  if (selected) {
    highlights.push('yfiles-react-node-highlight--selected')
  }
  return highlights.join(' ')
}

export function getUserProperties(data: Entity | Connection) {
  const internalProperties = [
    'id',
    'className',
    'style',
    'width',
    'height',
    'parentId',
    'connections'
  ]
  return Object.fromEntries(
    Object.entries(data)
      .filter(
        ([property, _value]) =>
          !property.startsWith('__') && internalProperties.every(key => property !== key)
      )
      .slice(0, 10)
  )
}
