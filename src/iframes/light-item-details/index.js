import React, { useState, useEffect, useMemo } from 'react'
import { Card, Result } from 'antd'
import { ethers } from 'ethers'
import _gtcr from '../../assets/abis/LightGeneralizedTCR.json'
import useProvider from '../../bootstrap/dapp-api'

export default () => {
  const [parameters, setParameters] = useState()
  const [errored, setErrored] = useState()
  const [itemID, setItemID] = useState()
  const {
    provider: fallbackProvider,
    error: fallbackProviderError
  } = useProvider()

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
      arbitratorContractAddress,
      jsonRpcUrl,
      chainId
    } = message

    if (!arbitrableContractAddress || !disputeID || !arbitratorContractAddress)
      return

    setParameters({
      arbitrableContractAddress,
      disputeID,
      arbitratorContractAddress,
      jsonRpcUrl,
      chainId
    })
  }, [parameters])

  const gtcr = useMemo(() => {
    if (!parameters) return
    const { arbitrableContractAddress, jsonRpcUrl } = parameters
    if (!jsonRpcUrl && !fallbackProvider) return

    let provider = fallbackProvider
    if (jsonRpcUrl) provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl)

    try {
      return new ethers.Contract(arbitrableContractAddress, _gtcr, provider)
    } catch (err) {
      console.error(`Error instantiating gtcr contract`, err)
      setErrored({
        title: 'Error loading item. Are you in the correct network?',
        subTitle: err.message
      })
      return null
    }
  }, [fallbackProvider, parameters])

  // Fetch item.
  useEffect(() => {
    if (!gtcr || itemID || !parameters) return
    const { arbitratorContractAddress, disputeID } = parameters
    ;(async () => {
      try {
        const itemID = await gtcr.arbitratorDisputeIDToItemID(
          arbitratorContractAddress,
          disputeID
        )
        console.info('itemID', itemID)
        setItemID(itemID)
      } catch (err) {
        console.error('Error fetching item', err)
        setErrored({
          title: 'Error fetching item. Are you in the correct network?',
          subTitle: err.message
        })
      }
    })()
  }, [gtcr, itemID, parameters])

  if (errored)
    return (
      <Card bordered>
        <Result
          status="warning"
          title={errored.title}
          subTitle={errored.subTitle}
        />
      </Card>
    )

  if (fallbackProviderError && !gtcr)
    return (
      <Card bordered>
        <Result status="warning" title={fallbackProviderError} />
      </Card>
    )

  if (!itemID || !parameters) return <Card loading bordered />

  const { arbitrableContractAddress, chainId } = parameters

  return (
    <Card bordered>
      {process.env.REACT_APP_GTCR_URL && (
        <a
          href={`${process.env.REACT_APP_GTCR_URL}/tcr/${arbitrableContractAddress}/${itemID}?chainId=${chainId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Submission
        </a>
      )}
    </Card>
  )
}
