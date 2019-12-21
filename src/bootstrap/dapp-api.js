import { ethers } from 'ethers'
import Archon from '@kleros/archon'
import { useEffect, useState, useMemo } from 'react'

const env = process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'
const ETHEREUM_PROVIDER = process.env[`REACT_APP_${env}_ETHEREUM_PROVIDER`]
const IPFS_URL = process.env[`REACT_APP_IPFS_URL`]

const useProvider = () => {
  const [error, setError] = useState(false)
  const [provider, setProvider] = useState()
  const archon = useMemo(() => {
    if (!provider) return
    return new Archon(provider._web3Provider, IPFS_URL)
  }, [provider])

  useEffect(() => {
    ;(async () => {
      if (provider) return
      try {
        if (window.web3 && window.web3.currentProvider && window.ethereum) {
          window.ethereum.enable
            ? await window.ethereum.enable()
            : await window.ethereum.sendAsync({
                method: 'eth_requestAccounts',
                params: []
              })
          setProvider(new ethers.providers.Web3Provider(window.ethereum))
        } else if (ETHEREUM_PROVIDER)
          setProvider(new ethers.providers.JsonRpcProvider(ETHEREUM_PROVIDER))
        else setError('No ethereum provider available.')
      } catch (err) {
        setError('Error setting up provider')
        console.error(err)
      }
    })()
  }, [provider])

  return { provider, archon, error }
}

export default useProvider
