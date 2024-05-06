import Basic from '../examples/Basic'
import AllDefaultStyles from '../examples/AllDefaultStyles'
import ContextMenu from '../examples/ContextMenu'
import CustomItemStyle from '../examples/CustomItemStyle'
import DefaultReactItemStyle from '../examples/DefaultReactItemStyle'
import SimpleData from '../examples/SimpleData'
import Tooltips from '../examples/Tooltips'
import Export from '../examples/Export'
import ExpandCollapse from '../examples/ExpandCollapse'
import Styling from '../examples/Styling'
import OverviewAndControls from '../examples/OverviewAndControls'
import SwitchRenderEntity from '../examples/SwitchRenderEntity'
import GraphSearch from '../examples/Search'

export interface IRoute {
  title: string
  description: string
  path: string
  component: React.ComponentType
}

const routes: IRoute[] = [
  { title: 'Basic Example', path: 'basic', component: Basic, description: 'A simple example' },
  {
    title: 'All Default Styles',
    path: 'all-default-styles',
    component: AllDefaultStyles,
    description: 'All supported default styles'
  },
  {
    title: 'Simple Data',
    path: 'simple-data',
    component: SimpleData,
    description: 'Minimal data example'
  },
  {
    title: 'Context Menu',
    path: 'contextmenu',
    component: ContextMenu,
    description: 'A simple example providing the context menu'
  },
  {
    title: 'Default React Node Style',
    path: 'default-react-node-style',
    component: DefaultReactItemStyle,
    description: 'Rendering nodes using the default React node style'
  },
  {
    title: 'Custom React Node Style',
    path: 'custom-react-node-style',
    component: CustomItemStyle,
    description: 'Rendering nodes using a custom React node style'
  },
  {
    title: 'Styling',
    path: 'styling',
    component: Styling,
    description: 'Changing the appearance of companies and connections'
  },
  {
    title: 'Tooltips',
    description: 'Demonstrates the tooltip popup',
    path: 'tooltips',
    component: Tooltips
  },
  {
    title: 'Export',
    description: 'An example demonstrating the export to an image and printing.',
    path: 'graph-export',
    component: Export
  },
  {
    title: 'Expand/Collapse',
    description: 'An example demonstrating how to use the expand and collapse functionality.',
    path: 'expand-collapse',
    component: ExpandCollapse
  },
  {
    title: 'Overview and Controls',
    description: 'An example demonstrating how to use the Overview and Controls Components.',
    path: 'overview',
    component: OverviewAndControls
  },
  {
    title: 'Switch Render Function',
    description: 'A test that switches the render function for entities.',
    path: 'switch-render-entity',
    component: SwitchRenderEntity
  },
  {
    title: 'Search',
    description: 'Simple example to demonstrate the search functionality of the component.',
    path: 'graph-search',
    component: GraphSearch
  }
]

export default routes
