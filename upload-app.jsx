const rawRedirectUri = window.location.origin + '/?authenticated=true';

async function getClientToken(code) {
  const requestData = new URLSearchParams()
  requestData.append('code', code)
  requestData.append('redirect_uri', rawRedirectUri)
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

function getToken() {
  return localStorage.getItem('photo_uploader_token') ?? null
}

function AppAuthentication({ children }) {
  const [ isAuthenticated, setAuthenticated ] = React.useState(getToken() !== null)
  const [ isLoading, setIsLoading ] = React.useState(true)

  React.useEffect(() => {
    if (!isAuthenticated) {
      handleAuthentication().then((token) => setAuthenticated(token !== null)).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isAuthenticated) {
    return children
  }

  const connect = () => {
    const redirectUri = encodeURIComponent(rawRedirectUri);
    const clientId = '4l2igbdm2itulbo';
    const url = `https://www.dropbox.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    console.log(`url`, url)
    console.log('redirectUrl', rawRedirectUri)
    window.location = url;
  }

  return <div><button onClick={() => connect()}>Connect DropBox</button></div>
}

function App() {

  const logout = () => {
    localStorage.removeItem('photo_uploader_token')
    window.location = window.location.origin
  }

  return <AppAuthentication>
    <span>You are logged in!</span>
    <button onClick={() => logout()}>Logout</button>
  </AppAuthentication>
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);