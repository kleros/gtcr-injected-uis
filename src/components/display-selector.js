import React from 'react'
import { Typography, Switch, Avatar, Skeleton } from 'antd'
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

const SkeletonTitleProps = { width: '150px' }
const StyledSkeleton = styled(Skeleton)`
  display: inline;

  .ant-skeleton-title {
    margin: -3px 0;
  }
`

const DisplaySelector = ({ type, value }) => {
  switch (type) {
    case itemTypes.GTCR_ADDRESS:
      return <GTCRAddress address={value || ZERO_ADDRESS} />
    case itemTypes.ADDRESS:
      return <ETHAddress address={value || ZERO_ADDRESS} />
    case itemTypes.TEXT:
    case itemTypes.NUMBER:
      return (
        <Typography.Text>
          {value || (
            <StyledSkeleton paragraph={false} title={SkeletonTitleProps} />
          )}
        </Typography.Text>
      )
    case itemTypes.BOOLEAN:
      return <Switch disabled checked={value} />
    case itemTypes.LONGTEXT:
      return <Typography.Paragraph>{value}</Typography.Paragraph>
    case itemTypes.IMAGE:
      return value ? (
        <StyledImage
          src={`${process.env.REACT_APP_IPFS_GATEWAY}${value}`}
          alt="item"
        />
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
  type: PropTypes.oneOf(Object.keys(itemTypes)).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
    PropTypes.object
  ]).isRequired
}

export default DisplaySelector
