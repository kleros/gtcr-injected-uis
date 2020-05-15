import React, { useState, useEffect, useMemo } from 'react'
import { Tooltip, Card, Icon, Result } from 'antd'
import styled from 'styled-components/macro'
import { ethers } from 'ethers'
import { abi as _gtcr } from '@kleros/tcr/build/contracts/GeneralizedTCR.json'
import useProvider from '../../bootstrap/dapp-api'
import { gtcrDecode } from '../../utils/encoder'
import DisplaySelector from '../../components/display-selector'

const StyledFields = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
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
  const { provider, error: providerError } = useProvider()

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
      setErrored(err)
      return null
    }
  }, [parameters, provider])

  // Fetch meta evidence.
  useEffect(() => {
    if (!parameters || metaEvidence || !gtcr) return
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
        console.error('Error fetching dispute information', err)
        setErrored(err)
      }
    })()
  }, [gtcr, metaEvidence, parameters, provider])

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
        setErrored(err)
      }
    })()
  }, [gtcr, item, itemID, parameters])

  // Decode item bytes once we have it and tfhe meta evidence.
  useEffect(() => {
    if (!item || !metaEvidence || decodedItem) return
    const { columns } = metaEvidence.metadata
    try {
      setDecodedItem({
        ...item,
        decodedData: gtcrDecode({ columns, values: item.data })
      })
    } catch (err) {
      console.error(err)
      setErrored(err)
    }
  }, [decodedItem, item, metaEvidence])

  if (errored || providerError)
    return (
      <Result
        status="error"
        title="Error fetching item. Are you on the correct network?"
        subTitle={errored.message}
      />
    )

  const columns = (metaEvidence && metaEvidence.metadata.columns) || null
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
