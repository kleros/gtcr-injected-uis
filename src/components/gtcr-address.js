import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from 'antd'
import styled from 'styled-components/macro'
import PropTypes from 'prop-types'
import { ethers } from 'ethers'

const StyledLink = styled(Link)`
  text-decoration: underline;
`

const GTCRAddress = ({ address }) => (
  <StyledLink to={`/tcr/${ethers.utils.getAddress(address)}`}>
    Visit TCR
    <Icon type="right-arrow" />
  </StyledLink>
)

GTCRAddress.propTypes = {
  address: PropTypes.string.isRequired
}

export default GTCRAddress
