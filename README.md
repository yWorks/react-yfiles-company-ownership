# yFiles React Company Ownership Component

[![NPM version](https://img.shields.io/npm/v/@yworks/react-yfiles-company-ownership?style=flat)](https://www.npmjs.org/package/@yworks/react-yfiles-company-ownership)

[![yFiles React Company Ownership Component](https://raw.githubusercontent.com/yWorks/react-yfiles-company-ownership/main/assets/react-company-ownership-hero.png)](https://docs.yworks.com/react-yfiles-company-ownership)

Welcome to the *yFiles React Company Ownership* component, a powerful and versatile React component based
on the [yFiles](https://www.yworks.com/yfiles-overview) library.  This component enables seamless integration
for displaying company ownership charts in your React applications.

## Getting Started

1. **Installation:**
   Install the component via npm by running the following command in your project directory:
   ```bash
   npm install @yworks/react-yfiles-company-ownership
      ```

   The company-ownership module has some peer dependencies that must be installed somewhere in your project. Since it is a React module, `react` and `react-dom` dependencies are needed.

   Additionally, the component relies on the [yFiles](https://www.yworks.com/yfiles-overview) library which is not published to the public npm registry. You can learn  how to work with the yFiles npm module in our [Developer's Guide](https://docs.yworks.com/yfileshtml/#/dguide/yfiles_npm_module).

   Ensure that the dependencies in the `package.json` file resemble the following:
   ```json
   {
     ...
     "dependencies": {
       "@yworks/react-yfiles-company-ownership": "^1.0.0",
       "react": "^18.2.0",
       "react-dom": "^18.2.0",
       "yfiles": "<yFiles package path>/lib/yfiles-26.0.0.tgz",
       ...
     }
   }
   ```

2. **License:**
   Before using the component, a valid [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html) version is required. You can evaluate yFiles for 60 days free of charge on [my.yworks.com](https://my.yworks.com/signup?product=YFILES_HTML_EVAL).
   Be sure to invoke the <TypeLink type="registerLicense" /> function to furnish the license file before utilizing the company-ownership component.

3. **Usage:**
   Utilize the component in your application. Make sure to import the CSS stylesheet.

   ```tsx
   import {
     CompanyOwnership,
     CompanyOwnershipData,
     Entity,
     Ownership,
     registerLicense
   } from '@yworks/react-yfiles-company-ownership'
   
   import '@yworks/react-yfiles-company-ownership/dist/index.css'
   
   import yFilesLicense from './license.json'
 
   function App() {
     registerLicense(yFilesLicense)
 
     const data: CompanyOwnershipData<Entity, Ownership> = {
       companies: [
         {
           id: 1,
           name: 'Monster Inc',
           type: 'Corporation'
         },
         {
           id: 2,
           name: 'Connect Partner',
           type: 'RCTB'
         },
         {
           id: 3,
           name: 'Large Scale Trust',
           type: 'Trust'
         }
       ],
       connections: [
         {
           type: 'Ownership',
           ownership: 0.4,
           sourceId: 1,
           targetId: 2
         },
         {
           type: 'Ownership',
           ownership: 0.2,
           sourceId: 1,
           targetId: 3
         }
       ]
     }
 
     return  <CompanyOwnership data={data}></CompanyOwnership>
   }
 
   export default App
   ```

   > **Note:** By default, the `CompanyOwnership` component adjusts its size to match the size of its parent element. Therefore, it is necessary to set the dimensions of the containing element or apply styling directly to the `CompanyOwnership` component. This can be achieved by defining a CSS class or applying inline styles.

## Documentation

Find the full documentation, API and many code examples in our [documentation](https://docs.yworks.com/react-yfiles-company-ownership).

## Live Playground

[![Live Playground](https://raw.githubusercontent.com/yWorks/react-yfiles-company-ownership/main/assets/playground.png)](https://docs.yworks.com/react-yfiles-company-ownership/introduction/welcome)

Try the yFiles React Company Ownership component directly in your browser with our [playground](https://docs.yworks.com/react-yfiles-company-ownership/introduction/welcome)

## Features

The component provides versatile features out of the box that can be further tailored to specific use cases.

<table>
    <tr>
        <td>
            <a href="https://docs.yworks.com/react-yfiles-company-ownership/introduction/welcome"><img src="https://raw.githubusercontent.com/yWorks/react-yfiles-company-ownership/main/assets/default-shapes.png" title="Default Shapes" alt="Default Shapes"></a><br>
            <a href="https://docs.yworks.com/react-yfiles-company-ownership/introduction/welcome">Default Shapes</a>
        </td>
        <td>
            <a href="https://docs.yworks.com/react-yfiles-company-ownership/features/custom-items"><img src="https://raw.githubusercontent.com/yWorks/react-yfiles-company-ownership/main/assets/custom-visualization.png" title="Custom visualization" alt="Custom visualization"></a><br>
            <a href="https://docs.yworks.com/react-yfiles-company-ownership/features/custom-items">Custom visualization</a>
        </td>
    </tr>
    <tr>
        <td>
            <a href="https://docs.yworks.com/react-yfiles-company-ownership/introduction/welcome"><img src="https://raw.githubusercontent.com/yWorks/react-yfiles-company-ownership/main/assets/level-of-detail.png" title="Level of detail visualization" alt="Level of detail visualization"></a><br>
            <a href="https://docs.yworks.com/react-yfiles-company-ownership/introduction/welcome">Level of detail visualization</a>
        </td>
        <td>
            <a href="https://docs.yworks.com/react-yfiles-company-ownership/features/search"><img src="https://raw.githubusercontent.com/yWorks/react-yfiles-company-ownership/main/assets/search.png" title="Search" alt="Search"></a><br>
            <a href="https://docs.yworks.com/react-yfiles-company-ownership/features/search">Search</a>
        </td>
    </tr>
</table>

Find all features in the [documentation](https://docs.yworks.com/react-yfiles-company-ownership) and try them directly in the
browser with our integrated code playground.

## Licensing

All owners of a valid software license for [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html)
are allowed to use these sources as the basis for their own [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html)
powered applications.

Use of such programs is governed by the rights and conditions as set out in the
[yFiles for HTML license agreement](https://www.yworks.com/products/yfiles-for-html/sla).

You can evaluate yFiles for 60 days free of charge on [my.yworks.com](https://my.yworks.com/signup?product=YFILES_HTML_EVAL).

For more information, see the `LICENSE` file. 

## Learn More

Explore the possibilities of visualizing large ownership hierarchies with the yFiles Company Ownership Component.
For further information about [yFiles for HTML](https://www.yworks.com/yfiles-overview) and our company, please visit [yWorks.com](https://www.yworks.com).

For support or feedback, please reach out to [our support team](https://www.yworks.com/contact) or open an [issue on GitHub](https://github.com/yWorks/react-yfiles-company-ownership/issues). Happy diagramming!
