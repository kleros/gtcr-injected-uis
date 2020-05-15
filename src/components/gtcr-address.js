import React from 'react'
import PropTypes from 'prop-types'
import { ethers } from 'ethers'

const GTCRAddress = ({ address }) => (
  <>
    {ethers.utils.getAddress(address)}{' '}
    <a
      href={`${process.env.REACT_APP_GTCR_URL}/tcr/${ethers.utils.getAddress(
        address
      )}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Click to Visit
    </a>
  </>
)

GTCRAddress.propTypes = {
  address: PropTypes.string.isRequired
}

export default GTCRAddress
