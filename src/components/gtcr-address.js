import React, { useMemo, useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import PropTypes from 'prop-types'
import { ethers } from 'ethers'
import { abi as _gtcr } from '@kleros/tcr/build/contracts/GeneralizedTCR.json'
import { Card, Avatar, Checkbox, Result } from 'antd'

const StyledAnchor = styled.a`
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
`

const StyledImage = styled.img`
  padding: 20px 0;
  object-fit: contain;
  max-width: 150px;
  max-height: 150px;
`

const StyledCard = styled(Card)`
  .ant-card-cover {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`

const GTCRAddress = ({ address, provider }) => {
  const [error, setError] = useState()
  const [metaEvidence, setMetaEvidence] = useState()

  const gtcr = useMemo(() => {
    if (!address || !provider) return
    try {
      return new ethers.Contract(address, _gtcr, provider)
    } catch (err) {
      console.error(`Error instantiating gtcr contract`, err)
      setError({
        title: 'Error loading item. Are you in the correct network?',
        subTitle: err.message
      })
      return null
    }
  }, [address, provider])

  // Fetch meta evidence.
  useEffect(() => {
    if (!address || metaEvidence || !gtcr) return
    ;(async () => {
      try {
        const { _evidence: metaEvidencePath } = (await provider.getLogs({
          ...gtcr.filters.MetaEvidence(),
          fromBlock: 0
        })).map(log => gtcr.interface.parseLog(log))[0].values
        const file = await (await fetch(
          process.env.REACT_APP_IPFS_GATEWAY + metaEvidencePath
        )).json()

        setMetaEvidence(file)
      } catch (err) {
        console.error('Error meta evidence information', err)
        setError({
          title:
            'Error meta evidence information. Are you in the correct network?',
          subTitle: err.message
        })
      }
    })()
  }, [gtcr, metaEvidence, address, provider])

  const { metadata } = metaEvidence || {}
  const {
    tcrTitle,
    tcrDescription,
    itemName,
    logoURI,
    requireRemovalEvidence,
    isTCRofTCRs
  } = metadata || {}

  if (!tcrTitle)
    return (
      <>
        {ethers.utils.getAddress(address)}{' '}
        <a
          href={`${
            process.env.REACT_APP_GTCR_URL
          }/tcr/${ethers.utils.getAddress(address)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Click to Visit
        </a>
        {error && (
          <Result status="warn" title={error.title} subTitle={error.subTitle} />
        )}
      </>
    )

  return (
    <>
      {address}
      <StyledCard
        title={tcrTitle}
        extra={
          <a
            href={`${
              process.env.REACT_APP_GTCR_URL
            }/tcr/${ethers.utils.getAddress(address)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit
          </a>
        }
        cover={
          <StyledAnchor
            href={`${process.env.REACT_APP_IPFS_GATEWAY}${logoURI}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <StyledImage
              src={`${
                logoURI ? (
                  `${process.env.REACT_APP_IPFS_GATEWAY}${logoURI}`
                ) : (
                  <Avatar shape="square" size="large" icon="file-image" />
                )
              }`}
              alt="tcr-Logo"
            />
          </StyledAnchor>
        }
      >
        <p>Description: {tcrDescription} </p>
        <p>Item Name: {itemName} </p>
        <p>
          TCR of TCRs?: <Checkbox checked={isTCRofTCRs} disabled />{' '}
        </p>
        <p>
          Requires evidence to remove items?:{' '}
          <Checkbox checked={requireRemovalEvidence} disabled />
        </p>
      </StyledCard>
    </>
  )
}

GTCRAddress.propTypes = {
  address: PropTypes.string.isRequired,
  // eslint-disable-next-line react/require-default-props
  // eslint-disable-next-line react/forbid-prop-types
  provider: PropTypes.object.isRequired
}

export default GTCRAddress
