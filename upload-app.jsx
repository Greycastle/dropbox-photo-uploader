const rawRedirectUri = window.location.origin + window.location.pathname + '?authenticated=true';

const nameLengthLimit = 120;

const FormContext = React.createContext({})

function FormContextProvider({ children }) {
  const [ date, setDate ] = React.useState(localStorage.getItem('form_date') ?? '')
  const [ firstName, setFirstName ] = React.useState(localStorage.getItem('form_firstName') ?? '')
  const [ lastName, setLastName ] = React.useState(localStorage.getItem('form_lastName') ?? '')
  const [ imagePurpose, setImagePurpose ] = React.useState({})

  React.useEffect(() => {
    localStorage.setItem('form_date', date)
    localStorage.setItem('form_firstName', firstName)
    localStorage.setItem('form_lastName', lastName)
  }, [ date, firstName, lastName ])

  const reset = () => {
    setImagePurpose({})
    setDate('')
    setFirstName('')
    setLastName('')
  }

  const state = {
    date,
    firstName,
    lastName,
    setDate,
    setFirstName,
    setLastName,
    imagePurpose,
    setImagePurpose,
    reset
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
    window.location = url;
  }

  return <div className="d-flex justify-content-center">
    <div className="mt-4 d-flex justify-content-center flex-column">
      <h1 className="mb-4">Photo uploader</h1>
      <button onClick={() => connect()}>Connect DropBox</button>
    </div>
  </div>
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
  const [ filename, setFilename ] = React.useState('')

  const formState = React.useContext(FormContext)

  React.useEffect(() => {
    const purpose = formState.imagePurpose[index] ?? ''
    setFilename(getFilename(index + 1, purpose, formState.firstName, formState.lastName, formState.date))
  }, [ formState ])

  const setPurpose = React.useCallback((purpose) => {
    formState.setImagePurpose({ ...formState.imagePurpose, [index]: purpose })
  }, [ index, formState.imagePurpose ])

  const lengthExceeded = filename.length > nameLengthLimit

  return <div className="card w-100 p-1 d-flex flex-row">
    <img src={src} style={{ maxWidth: '20rem', objectFit: 'contain', borderRadius: 'var(--bs-card-border-radius)' }} />
    <div className="d-flex flex-column row-gap-2 flex-grow-1 mx-2" style={{ overflow: 'hidden' }}>
      <label className="w-100">
        Purpose
        <input className="w-100" name="purpose" autoComplete="on" type="text" value={formState.imagePurpose[index] ?? ''} onChange={(e) => setPurpose(e.target.value)} />
        { lengthExceeded && <span className="text-danger">Filename too long, reduce the length of the name or the purpose</span> }
      </label>
      <div>
        <label>Final filename:</label><br/>
        <span>{ filename }</span>
      </div>
      <a className="mt-4" href="#" onClick={() => onRemove(index)}>Remove</a>
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
    const purpose = formState.imagePurpose[index] ?? '_'
    const filename = getFilename(index + 1, purpose, formState.firstName, formState.lastName, formState.date)
    const path = `/${folderName}/${filename}`
    return uploadFile(path, image)
  })
  await Promise.all(tasks)
  console.log(`Upload completed!`)
}

function UploadInterface() {
  const [ images, setImages ] = React.useState([])
  const [ uploadState, setUploadState ] = React.useState('pending')
  const fileButton = React.useRef(null)

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
    setUploadState('uploading')
    const folderName = `${capitalize(formState.firstName)}${capitalize(formState.lastName)}`
    await createFolder(folderName)
    await uploadFiles(folderName, images, formState)
    setImages([])
    formState.reset()
    setUploadState('success')
  }, [ formState, images ])

  return <div className="w-100" style={ { 'maxWidth': '920px' } }>
    <header className="d-flex justify-content-between mb-4">
      <span className="title">Photo uploader</span>
      <a href="#" onClick={() => logout()}>Logout</a>
    </header>
    { uploadState === 'pending' && <div>
      <form className="d-flex flex-column row-gap-4">
        <div id="core-inputs" className="d-flex w-100 justify-content-between column-gap-4">
          <label className="flex-grow-1">
            <span>Date</span>
            <input className="w-100" type="date" value={formState.date} onChange={(e) => formState.setDate(e.target.value)} />
          </label>
          <label className="flex-grow-1">
            <span>First name</span>
            <input className="w-100" type="text" autoComplete="off" value={formState.firstName} onChange={(e) => formState.setFirstName(e.target.value)} />
          </label>
          <label className="flex-grow-1">
            <span>Last name</span>
            <input className="w-100" type="text" autoComplete="off" value={formState.lastName} onChange={(e) => formState.setLastName(e.target.value)} />
          </label>
        </div>
        <div className="file-upload p-4" onClick={(e) => fileButton.current.click(e)}>
          <span>Click to select files</span>
          <input ref={fileButton} id="file-upload" type="file" accept="image/*" multiple onChange={handleFiles} />
        </div>
        <div id="image-previews" className="d-flex flex-column row-gap-4">
          { images.map((src, index) => <ImageCard key={index} index={index} src={src} onRemove={onRemove} />) }
        </div>
        <div>
          <button onClick={(e) => { e.preventDefault(); upload(); }}>Save photos</button>
        </div>
      </form>
    </div> }
    { uploadState === 'uploading' && <div>Uploading..</div>}
    { uploadState === 'success' && <div>
      <p>Upload completed!</p>
      <button onClick={() => setUploadState('pending')}>Continue</button>
      </div>}
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