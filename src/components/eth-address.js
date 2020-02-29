import React from 'react'
import PropTypes from 'prop-types'

const ETHAddress = ({ address, networkName }) => (
  <a
    href={`https://${networkName}etherscan.io/address/${address}`}
    rel="noopener noreferrer"
    target="_blank"
  >
    {address.slice(0, 6)}...{address.slice(address.length - 4)}
  </a>
)

ETHAddress.propTypes = {
  address: PropTypes.string.isRequired,
  networkName: PropTypes.string
}

ETHAddress.defaultProps = {
  networkName: ''
}

export default ETHAddress
