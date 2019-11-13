import { ethers } from 'ethers'
import Archon from '@kleros/archon'
import { useEffect, useState } from 'react'

const env = process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'
const ETHEREUM_PROVIDER = process.env[`REACT_APP_${env}_ETHEREUM_PROVIDER`]
const IPFS_URL = process.env[`REACT_APP_IPFS_URL`]

const useProvider = () => {
  const [error, setError] = useState(false)
  const [provider, setProvider] = useState()
  const [archon, setArchon] = useState()
  useEffect(() => {
    ;(async () => {
      try {
        if (window.web3 && window.web3.currentProvider && window.ethereum) {
          await window.ethereum.enable()
          setProvider(
            new ethers.providers.Web3Provider(window.web3.currentProvider)
          )
        } else if (ETHEREUM_PROVIDER)
          setProvider(new ethers.providers.JsonRpcProvider(ETHEREUM_PROVIDER))
        else setError('No ethereum provider available.')
      } catch (err) {
        setError('Error setting up provider')
        console.error(err)
      }
    })()
  }, [])

  useEffect(() => {
    if (!provider) return
    setArchon(new Archon(provider._web3Provider, IPFS_URL))
  }, [provider])

  return { provider, archon, error }
}

export default useProvider
