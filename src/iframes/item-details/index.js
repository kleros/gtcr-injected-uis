import React, { Component } from 'react'
import ArbitrableTokenList from '../../assets/contracts/arbitrable-token-list.json'
import { eth, IPFS_URL, S3_URL, T2CR_URL, web3 } from '../../bootstrap/dapp-api'
import './t2cr-evidence.css'

class TTCREvidence extends Component {
  state = { token: null }

  async componentDidMount() {
    if (window.location.search[0] !== '?') return
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

    const arbitrableTokenList = eth
      .contract(ArbitrableTokenList.abi)
      .at(arbitrableContractAddress)

    const ID = await arbitrableTokenList.arbitratorDisputeIDToTokenID(
      arbitratorContractAddress,
      disputeID
    )
    const token = await arbitrableTokenList.getTokenInfo(ID[0])
    token.ID = ID[0]
    this.setState({ token })
  }

  onImgError = e => {
    e.target.style.display = 'none'
  }

  render() {
    const { token } = this.state
    if (!token) return null

    let symbolURI
    if (token.symbolMultihash)
      symbolURI =
        token.symbolMultihash[0] === '/'
          ? `${IPFS_URL}${token.symbolMultihash}`
          : `${S3_URL}/${token.symbolMultihash}`

    return (
      <div className="TTCREvidence">
        <h4 style={{ margin: '0 0 12px 0' }}>The Token in Question:</h4>
        <div className="TTCREvidence-data">
          <img className="TTCREvidence-symbol" src={symbolURI} alt="Avatar" />
          <div className="TTCREvidence-data-card">
            <div
              className="TTCREvidence-container"
              style={{ overflowX: 'initial' }}
            >
              <p className="TTCREvidence-container-name">
                <b>{token.name}</b>
              </p>
              <p className="TTCREvidence-container-ticker">{token.ticker}</p>
            </div>
            <div className="TTCREvidence-data-separator" />
            <div className="TTCREvidence-container">
              <p className="TTCREvidence-container-multiline TTCREvidence-label">
                Address
              </p>
              <p className="TTCREvidence-container-multiline TTCREvidence-value">
                {web3.utils.toChecksumAddress(token.addr)}
              </p>
              <a
                className="TTCREvidence-link"
                href={`${T2CR_URL}/token/${token.ID}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <p
                  className="TTCREvidence-container-multiline"
                  style={{ marginTop: '10px' }}
                >
                  View Submission
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TTCREvidence
