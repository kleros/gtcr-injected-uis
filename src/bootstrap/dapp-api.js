import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

const env = process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'
const ETHEREUM_PROVIDER = process.env[`REACT_APP_${env}_ETHEREUM_PROVIDER`]

const useProvider = () => {
  const [error, setError] = useState(false)
  const [provider, setProvider] = useState()

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

  return { provider, error }
}

export default useProvider
