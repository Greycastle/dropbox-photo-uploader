import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import LoginButton from '@/components/LoginButton.jsx'
import { handleLoginRedirect, isLoggedIn } from '@/state/auth';

export default function AppAuthentication({ children }) {
  const [ isAuthenticated, setAuthenticated ] = useState(isLoggedIn())
  const [ isLoading, setIsLoading ] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      handleLoginRedirect().then((isLoggedIn) => setAuthenticated(isLoggedIn)).finally(() => setIsLoading(false))
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