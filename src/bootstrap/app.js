import React from 'react'
import { Helmet } from 'react-helmet'
import ItemDetails from '../iframes/item-details'

// TODO: Use routes.
const App = () => (
  <>
    <Helmet>
      <title>Kleros - GTCR</title>
    </Helmet>
    <ItemDetails />
  </>
)

export default App
