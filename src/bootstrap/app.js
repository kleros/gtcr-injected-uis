import React from 'react'
import { Helmet } from 'react-helmet'
import LightItemDetails from '../iframes/light-item-details'
import 'antd/dist/antd.css'
import './styles.css'

const App = () => (
  <>
    <Helmet>
      <title>Kleros - Curate Injected Displays</title>
    </Helmet>
    <LightItemDetails />
  </>
)

export default App
