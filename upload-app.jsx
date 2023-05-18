const rawRedirectUri = window.location.origin + window.location.pathname + '?authenticated=true';

console.log(`rawRedirectUri`, rawRedirectUri)

const FormContext = React.createContext({})

function FormContextProvider({ children }) {
  const [ date, setDate ] = React.useState(localStorage.getItem('form_date') ?? '')
  const [ firstName, setFirstName ] = React.useState(localStorage.getItem('form_firstName') ?? '')
  const [ lastName, setLastName ] = React.useState(localStorage.getItem('form_lastName') ?? '')

  React.useEffect(() => {
    localStorage.setItem('form_date', date)
    localStorage.setItem('form_firstName', firstName)
    localStorage.setItem('form_lastName', lastName)
  }, [ date, firstName, lastName ])

  const state = {
    date,
    firstName,
    lastName,
    setDate,
    setFirstName,
    setLastName
  }

  return <FormContext.Provider value={state}>
    { children }
  </FormContext.Provider>
}

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

  return <div className="d-flex justify-content-center"><button onClick={() => connect()}>Connect DropBox</button></div>
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

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getFilename(index, purpose, firstName, lastName, date) {
  const datePart = date.replaceAll('-', '')
  const namePart = `${capitalize(firstName)}${capitalize(lastName)}`
  const purposePart = purpose.replaceAll(' ', '_')
  return `${datePart}.${namePart}.${purposePart}.${index}.jpg`
}

function ImageCard({ src, index, onRemove }) {
  const [ purpose, setPurpose ] = React.useState('')
  const [ filename, setFilename ] = React.useState('')

  const formState = React.useContext(FormContext)

  React.useEffect(() => {
    setFilename(getFilename(index + 1, purpose, formState.firstName, formState.lastName, formState.date))
  }, [ formState.date, formState.firstName, formState.lastName, purpose ])

  return <div className="card w-50 p-4 d-flex">
    <img src={src} />
    <div className="d-flex row">
      <label>
        Purpose
        <input name="purpose" autoComplete="on" type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
      </label>
      <span>Final filename: { filename } </span>
      <a href="#" onClick={() => onRemove(index)}>Remove</a>
    </div>
  </div>
}

async function createFolder(name) {
  const response = await fetch('https://api.dropboxapi.com/2/files/create_folder_v2', {
    headers: {
      'authorization': `Bearer ${getToken()}`,
      'content-type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      path: '/' + name,
      autorename: false
    })
  })

  if (response.status === 200) {
    return
  }

  if (response.status === 409) {
    console.log('Folder already exists')
    return
  }

  const data = await response.json()
  console.log(`Failed to create folder ${response.status}`, data)
}

async function convertDataUrlToOctetStream(dataUrl) {
  const response = await fetch(dataUrl);
  return await response.blob();
}

async function uploadFile(path, dataUrl) {
  const data = await convertDataUrlToOctetStream(dataUrl)
  const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
    headers: {
      'authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({ path, autorename: false })
    },
    method: 'POST',
    body: data
  })

  if (response.status === 200) {
    return
  }
  if (response.status === 409) {
    console.log('File already exists: ' + path)
    return
  }
  const responseJson = await response.json()
  console.error(`Failed to upload: ${path}`, responseJson)
}

async function uploadFiles(folderName, images, formState) {
  console.log(`Uploading ${images.length} images..`)
  const tasks = images.map((image, index) => {
    const filename = getFilename(index + 1, 'purpose', formState.firstName, formState.lastName, formState.date)
    const path = `/${folderName}/${filename}`
    return uploadFile(path, image)
  })
  await Promise.all(tasks)
  console.log(`Upload completed!`)
}

function UploadInterface() {
  const [ images, setImages ] = React.useState([])

  const handleFiles = async (event) => {
    const files = event.target.files;
    const newImages = await Promise.all(Array.from(files).map(loadImage))
    setImages([ ...images, ...newImages ])
  }

  const onRemove = React.useCallback((index) => {
    const updated = [ ...images ]
    updated.splice(index, 1)
    setImages(updated)
  }, [images])

  const formState = React.useContext(FormContext)

  const upload = React.useCallback(async () => {
    const folderName = `${capitalize(formState.firstName)}${capitalize(formState.lastName)}`
    await createFolder(folderName)
    await uploadFiles(folderName, images, formState)
  }, [ formState, images ])

  return <div className="w-100" style={ { 'maxWidth': '920px' } }>
    <header className="d-flex justify-content-between mb-4">
      <span>Upload photos</span>
      <a href="#" onClick={() => logout()}>Logout</a>
    </header>
    <div>
      <form className="d-flex row" style={{ 'gap': '2rem'}}>
        <div id="core-inputs" className="d-flex justify-content-between gap-4">
          <label>
            <span>Date</span>
            <input type="date" value={formState.date} onChange={(e) => formState.setDate(e.target.value)} />
          </label>
          <label>
            <span>First name</span>
            <input type="text" autoComplete="off" value={formState.firstName} onChange={(e) => formState.setFirstName(e.target.value)} />
          </label>
          <label>
            <span>Last name</span>
            <input type="text" autoComplete="off" value={formState.lastName} onChange={(e) => formState.setLastName(e.target.value)} />
          </label>
        </div>
        <div id="upload">
          <input type="file" accept="image/*" multiple onChange={handleFiles} />
        </div>
        <div id="image-previews" className="d-flex flex-wrap gap-4">
          { images.map((src, index) => <ImageCard key={index} index={index} src={src} onRemove={onRemove} />) }
        </div>
        <div>
          <button onClick={(e) => { e.preventDefault(); upload(); }}>Save photos</button>
        </div>
      </form>
    </div>
  </div>
}

function App() {
  return <AppAuthentication>
    <FormContextProvider>
      <UploadInterface />
    </FormContextProvider>
  </AppAuthentication>
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);