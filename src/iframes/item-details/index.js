import React, { useState, useEffect, useMemo } from 'react'
import { Typography, Switch, Tooltip, Card, Icon, Result } from 'antd'
import styled from 'styled-components/macro'
import PropTypes from 'prop-types'
import { abi as _gtcr } from '@kleros/tcr/build/contracts/GeneralizedTCR.json'
import useProvider from '../../bootstrap/dapp-api'
import itemTypes from '../../utils/item-types'
import { gtcrDecode } from '../../utils/encoder'
import { ethers } from 'ethers'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ZERO_BYTES32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

const EthAddress = ({ address, networkName }) => (
  <a
    href={`https://${networkName}etherscan.io/address/${address}`}
    rel="noopener noreferrer"
    target="_blank"
  >
    {address.slice(0, 6)}...{address.slice(address.length - 4)}
  </a>
)

EthAddress.propTypes = {
  address: PropTypes.string.isRequired,
  networkName: PropTypes.string
}

EthAddress.defaultProps = {
  networkName: ''
}

const DisplaySelector = ({ type, value, networkName }) => {
  switch (type) {
    case itemTypes.ADDRESS:
      return (
        <EthAddress address={value || ZERO_ADDRESS} networkName={networkName} />
      )
    case itemTypes.TEXT:
    case itemTypes.NUMBER:
      return <Typography.Text>{value || 'XYZ'}</Typography.Text>
    case itemTypes.BOOLEAN:
      return <Switch disabled checked={value} />
    case itemTypes.LONGTEXT:
      return <Typography.Paragraph>{value}</Typography.Paragraph>
    default:
      throw new Error(`Unhandled type ${type}.`)
  }
}

const StyledFields = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`

const StyledField = styled.div`
  margin-bottom: 16px;
  margin-right: 16px;
  word-break: break-word;
`

export default () => {
  const [parameters, setParameters] = useState()
  const [errored, setErrored] = useState()
  const [metaEvidence, setMetaEvidence] = useState()
  const [decodedItem, setDecodedItem] = useState()
  const [item, setItem] = useState()
  const [itemID, setItemID] = useState()
  const { archon, provider, error: providerError } = useProvider()

  // Read query parameters.
  useEffect(() => {
    if (window.location.search[0] !== '?' || parameters) return
    const message = JSON.parse(
      window.location.search
        .substring(1)
        .replace(/%22/g, '"')
        .replace(/%7B/g, '{')
        .replace(/%3A/g, ':')
        .replace(/%2C/g, ',')
        .replace(/%7D/g, '}')
    )

    const {
      disputeID,
      arbitrableContractAddress,
      arbitratorContractAddress
    } = message

    if (!arbitrableContractAddress || !disputeID || !arbitratorContractAddress)
      return

    setParameters({
      arbitrableContractAddress,
      disputeID,
      arbitratorContractAddress
    })
  }, [parameters])

  const gtcr = useMemo(() => {
    if (!parameters || !provider) return
    const { arbitrableContractAddress } = parameters
    try {
      return new ethers.Contract(arbitrableContractAddress, _gtcr, provider)
    } catch (err) {
      console.error('Error instantiating gtcr contract', err)
      setErrored(true)
      return null
    }
  }, [parameters, provider])

  // Fetch meta evidence.
  useEffect(() => {
    if (!parameters || !archon || metaEvidence) return
    ;(async () => {
      const {
        arbitrableContractAddress,
        arbitratorContractAddress,
        disputeID
      } = parameters

      const disputeLog = await archon.arbitrable.getDispute(
        arbitrableContractAddress,
        arbitratorContractAddress,
        disputeID
      )

      archon.arbitrable
        .getMetaEvidence(arbitrableContractAddress, disputeLog.metaEvidenceID, {
          fromBlock: 0
        })
        .then(m => setMetaEvidence(m))
        .catch(err => {
          setErrored('Error fetching meta evidence')
          console.error(err)
        })
    })()
  }, [archon, metaEvidence, parameters])

  // Fetch item.
  useEffect(() => {
    if (!gtcr || itemID || item) return
    const { arbitratorContractAddress, disputeID } = parameters
    ;(async () => {
      try {
        const itemID = await gtcr.arbitratorDisputeIDToItem(
          arbitratorContractAddress,
          disputeID
        )
        setItemID(itemID)
        setItem(await gtcr.getItemInfo(itemID))
      } catch (err) {
        console.error(err)
        setErrored(true)
      }
    })()
  }, [gtcr, item, itemID, parameters])

  // Decode item bytes once we have it and the meta evidence.
  useEffect(() => {
    if (!item || !metaEvidence || !metaEvidence.metaEvidenceJSON || decodedItem)
      return
    const { columns } = metaEvidence.metaEvidenceJSON
    try {
      setDecodedItem({
        ...item,
        decodedData: gtcrDecode({ columns, values: item.data })
      })
    } catch (err) {
      console.error(err)
      setErrored(true)
    }
  }, [decodedItem, item, metaEvidence])

  if (errored || providerError || (metaEvidence && !metaEvidence.fileValid))
    return (
      <Result
        status="error"
        title="Error fetching item."
        subTitle="Are you on the correct network?"
      />
    )

  const columns =
    (metaEvidence && metaEvidence.metaEvidenceJSON.columns) || null
  const loading = !decodedItem

  if (loading || !itemID || !parameters) return <Card loading bordered />

  const { arbitrableContractAddress } = parameters

  return (
    <Card bordered>
      {columns && (
        <StyledFields>
          {columns.map((column, index) => (
            <StyledField key={index}>
              <span>
                {column.label}
                {column.description && (
                  <Tooltip title={column.description}>
                    &nbsp;
                    <Icon type="question-circle-o" />
                  </Tooltip>
                )}
              </span>
              :{' '}
              <DisplaySelector
                type={column.type}
                value={decodedItem && decodedItem.decodedData[index]}
              />
            </StyledField>
          ))}
        </StyledFields>
      )}
      {process.env.REACT_APP_GTCR_URL && (
        <a
          href={`${process.env.REACT_APP_GTCR_URL}/tcr/${arbitrableContractAddress}/${itemID}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Item
        </a>
      )}
    </Card>
  )
}
