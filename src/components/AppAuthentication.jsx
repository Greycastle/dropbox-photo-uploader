import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import LoginButton from '@/components/LoginButton.jsx'
import getRedirectURI from '@/services/get-redirect-uri.js';
import { getToken } from '@/state/auth-token.js'

async function getClientToken(code) {
  const requestData = new URLSearchParams()
  requestData.append('code', code)
  requestData.append('redirect_uri', getRedirectURI())
  requestData.append('grant_type', 'authorization_code')
  requestData.append('client_id', '4l2igbdm2itulbo')
  requestData.append('client_secret', '61wvzp38lui8171')

  const data = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestData
  }).then(res => res.json())
    .catch(err => console.error(err))
  console.log(`got token, expires in ${data.expires_in} seconds`)
  return data.access_token
}

async function handleAuthentication() {
  const url = new URL(window.location.href);
  const authenticated = url.searchParams.get('authenticated');
  if (!authenticated) {
    return null
  }
  const code = url.searchParams.get('code');
  const token = await getClientToken(code)
  localStorage.setItem('photo_uploader_token', token)
  return token
}

export default function AppAuthentication({ children }) {
  const [ isAuthenticated, setAuthenticated ] = useState(getToken() !== null)
  const [ isLoading, setIsLoading ] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      handleAuthentication().then((token) => setAuthenticated(token !== null)).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isAuthenticated) {
    return children
  }

  return <div className="d-flex justify-content-center">
    <div className="mt-4 d-flex justify-content-center flex-column">
      <h1 className="mb-4">Photo uploader</h1>
      <LoginButton/>
    </div>
  </div>
}

AppAuthentication.propTypes = {
  children: PropTypes.node.isRequired,
}