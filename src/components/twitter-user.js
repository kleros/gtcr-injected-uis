import React, { useEffect, useState } from 'react'
import { Result, Skeleton } from 'antd'
import Avatar from 'antd/lib/avatar/avatar'
import Meta from 'antd/lib/card/Meta'
import PropTypes from 'prop-types'
import styled from 'styled-components/macro'

const CORSProxyURL = process.env.REACT_APP_CORS_PROXY_URL
const authToken = `Bearer ${process.env.REACT_APP_BEARER_TOKEN}`

const StyledMeta = styled(Meta)`
  margin: 0;
  display: flex;
  align-items: center;
`

const TwitterUser = ({ userID }) => {
  const [user, setUser] = useState()
  // Fetch user
  useEffect(() => {
    if (!userID) return
    ;(async () => {
      try {
        const res = await fetch(
          `${CORSProxyURL}/https://api.twitter.com/2/users/${userID}?user.fields=profile_image_url`,
          {
            headers: {
              authorization: authToken
            }
          }
        )
        setUser(await res.json())
      } catch (err) {
        setUser({ error: err })
      }
    })()
  }, [userID])

  if (!userID)
    return (
      <Result
        status="warning"
        title={`Invalid user ID ${userID}`}
        subTitle={`Expected parameters format: /index.html?{"userID":"123456"}`}
      />
    )

  if (!user) return <Skeleton loading active />

  const { data, error } = user || {}

  if (error)
    return (
      <Result
        status="warning"
        title={`Error fetching user for id ${userID}`}
        subTitle={error}
      />
    )

  const { id, name, profile_image_url: imageURL, username } = data

  return (
    <StyledMeta
      avatar={<Avatar size={64} src={imageURL.replace('normal', 'bigger')} />}
      title={name}
      description={
        <>
          <a alt="twitter-username" href={`twitter.com/${username}`}>
            @{username}
          </a>
          - {id}
        </>
      }
    />
  )
}

TwitterUser.propTypes = {
  userID: PropTypes.number
}

TwitterUser.defaultProps = {
  userID: null
}

export default TwitterUser
