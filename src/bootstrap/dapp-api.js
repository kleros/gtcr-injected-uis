import { ethers } from 'ethers'

const env = process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'
const ETHEREUM_PROVIDER = process.env[`REACT_APP_${env}_ETHEREUM_PROVIDER`]
const IPFS_URL = process.env[`REACT_APP_IPFS_URL`]

let provider
if (window.web3 && window.web3.currentProvider)
  provider = new ethers.providers.Web3Provider(web3.currentProvider)
else provider = new ethers.providers.JsonRpcProvider(ETHEREUM_PROVIDER)

export { provider, IPFS_URL }
