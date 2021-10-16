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
        .replace(/%2F/g, '/')
    )

    const {
      disputeID,
      arbitrableContractAddress,
      arbitratorContractAddress,
      arbitrableChainID,
      arbitrableJsonRpcUrl
    } = message

    if (!arbitrableContractAddress || !disputeID || !arbitratorContractAddress)
      return

    setParameters({
      arbitrableContractAddress,
      arbitratorContractAddress,
      disputeID,
      arbitrableChainID,
      arbitrableJsonRpcUrl
    })
  }, [parameters])

  const arbitrableSigner = useMemo(() => {
    if (!parameters) return

    const { arbitrableJsonRpcUrl } = parameters
    if (!arbitrableJsonRpcUrl && !fallbackProvider) return

    let provider = fallbackProvider
    if (arbitrableJsonRpcUrl)
      provider = new ethers.providers.JsonRpcProvider(arbitrableJsonRpcUrl)

    // Using a random signer because provider does not have getChainId for
    // whatever reason.
    return new ethers.Wallet('0x123123123123123123123132123123', provider)
  }, [fallbackProvider, parameters])

  const gtcr = useMemo(() => {
    if (!parameters) return
    if (!arbitrableSigner) return
    const { arbitrableContractAddress } = parameters

    try {
      return new ethers.Contract(
        arbitrableContractAddress,
        _gtcr,
        arbitrableSigner
      )
    } catch (err) {
      console.error(`Error instantiating gtcr contract`, err)
      setErrored({
        title: 'Error loading item. Are you in the correct network?',
        subTitle: err.message
      })
      return null
    }
  }, [arbitrableSigner, parameters])

  // Fetch item.
  useEffect(() => {
    if (!gtcr || itemID || !parameters) return
    const {
      arbitratorContractAddress,
      disputeID,
      arbitrableChainID
    } = parameters
    ;(async () => {
      try {
        const chainID = await arbitrableSigner.getChainId()
        if (chainID !== Number(arbitrableChainID))
          throw new Error(
            `Mismatch on chain Id. Injected: ${arbitrableChainID}, provider ${chainID}`
          )
      } catch (err) {
        console.error(`Error fetching item`, err)
        setErrored({
          title: `Invalid. Mismatch between injected and provider chainID`,
          subTitle: err.message
        })
      }
      try {
        const itemID = await gtcr.arbitratorDisputeIDToItemID(
          arbitratorContractAddress,
          disputeID
        )
        setItemID(itemID)
      } catch (err) {
        console.error('Error fetching item', err)
        setErrored({
          title: 'Error fetching item. Are you in the correct network?',
          subTitle: err.message
        })
      }
    })()
  }, [arbitrableSigner, gtcr, itemID, parameters])

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

  const { arbitrableContractAddress, arbitrableChainID } = parameters

  return (
    <Card bordered>
      {process.env.REACT_APP_GTCR_URL && (
        <a
          href={`${process.env.REACT_APP_GTCR_URL}/tcr/${arbitrableContractAddress}/${itemID}?chainId=${arbitrableChainID}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Submission
        </a>
      )}
    </Card>
  )
}
