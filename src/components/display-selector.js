import React from 'react'
import { Typography, Avatar, Checkbox } from 'antd'
import styled from 'styled-components/macro'
import PropTypes from 'prop-types'
import itemTypes from '../utils/item-types'
import { ZERO_ADDRESS } from '../utils/string'
import GTCRAddress from './gtcr-address'
import ETHAddress from './eth-address'

const StyledImage = styled.img`
  object-fit: contain;
  height: 100px;
  width: 100px;
  padding: 5px;
`

const DisplaySelector = ({ type, value, provider }) => {
  switch (type) {
    case itemTypes.GTCR_ADDRESS:
      return <GTCRAddress address={value || ZERO_ADDRESS} provider={provider} />
    case itemTypes.ADDRESS:
      return <ETHAddress address={value || ZERO_ADDRESS} />
    case itemTypes.TEXT:
    case itemTypes.NUMBER:
      return <Typography.Text>{value}</Typography.Text>
    case itemTypes.BOOLEAN:
      return <Checkbox checked={value} disabled />
    case itemTypes.LONGTEXT:
      return <Typography.Paragraph>{value}</Typography.Paragraph>
    case itemTypes.IMAGE:
      return value ? (
        <a
          href={`${process.env.REACT_APP_IPFS_GATEWAY}${value}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <StyledImage
            src={`${process.env.REACT_APP_IPFS_GATEWAY}${value}`}
            alt="item"
          />
        </a>
      ) : (
        <Avatar shape="square" size="large" icon="file-image" />
      )
    default:
      return (
        <Typography.Paragraph>
          Error: Unhandled Type {type} for data {value}
        </Typography.Paragraph>
      )
  }
}

DisplaySelector.propTypes = {
  type: PropTypes.oneOf(Object.values(itemTypes)).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
    PropTypes.object
  ]).isRequired,
  // eslint-disable-next-line react/require-default-props
  // eslint-disable-next-line react/forbid-prop-types
  provider: PropTypes.object.isRequired
}

export default DisplaySelector
