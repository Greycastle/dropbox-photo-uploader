const rawRedirectUri = window.location.origin + window.location.pathname + '/?authenticated=true';

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

function logout() {
  localStorage.removeItem('photo_uploader_token')
  window.location = window.location.origin
}

async function loadImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result)
    };

    reader.readAsDataURL(file);
  })
}

function ImageCard({ src, index }) {
  return <div className="card w-50 p-4">
    <img src={src} />
    <span>Image { index }</span>
  </div>
}

function UploadInterface() {
  const [ images, setImages ] = React.useState([])

  const handleFiles = async (event) => {
    const files = event.target.files;
    const newImages = await Promise.all(Array.from(files).map(loadImage))
    setImages([ ...images, ...newImages ])
  }

  return <div className="w-100" style={ { 'maxWidth': '920px' } }>
    <header className="d-flex justify-content-between mb-4">
      <span>Upload photos</span>
      <span onClick={() => logout()}>Logout</span>
    </header>
    <div>
      <form className="d-flex row" style={{ 'gap': '2rem'}}>
        <div id="core-inputs" className="d-flex justify-content-between gap-4">
          <label>
            <span>Date</span>
            <input type="date" />
          </label>
          <label>
            <span>First name</span>
            <input type="text" />
          </label>
          <label>
            <span>Last name</span>
            <input type="text" />
          </label>
        </div>
        <div id="upload">
          <input type="file" accept="image/*" multiple onChange={handleFiles} />
        </div>
        <div id="image-previews" className="d-flex wrap gap-4">
          { images.map((src, index) => <ImageCard key={index} index={index} src={src} />) }
        </div>
        <div>
          <button>Save photos</button>
        </div>
      </form>
    </div>
  </div>
}

function App() {
  return <AppAuthentication>
    <UploadInterface />
  </AppAuthentication>
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);