import React from 'react'
import { Helmet } from 'react-helmet'
import ItemDetails from '../iframes/item-details'
import 'antd/dist/antd.css'
import './styles.css'

const App = () => (
  <>
    <Helmet>
      <title>Kleros - Curate Injected Displays</title>
    </Helmet>
    <ItemDetails />
  </>
)

export default App
