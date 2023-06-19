import { useState, useCallback, useContext, useMemo } from 'react'
import capitalize from '@/services/capitalize'
import uploadFiles from '@/services/upload-files'
import createFolder from '@/services/create-folder'
import FormContext from '@/state/form-context'
import { logout } from '@/state/auth'

import ImageCard from '@/components/ImageCard'
import FileInput from '@/components/FileInput'

import styles from './UploadPage.module.css'

function trimInput(input) {
  return input.split(' ').map((part) => capitalize(part)).join('').trim();
}

export default function UploadPage() {
  const [ images, setImages ] = useState([])
  const [ uploadState, setUploadState ] = useState('pending')
  const [ errorInformation, setErrorInformation ] = useState(null)

  const onRemove = useCallback((index) => {
    const updated = [ ...images ]
    updated.splice(index, 1)
    setImages(updated)
  }, [images])

  const formState = useContext(FormContext)

  const isFormReady = useMemo(() => {
    const isSet = (txt) => txt && txt.length > 0;
    const mainFieldsFilled = formState.date && isSet(formState.firstName) && isSet(formState.lastName)
    const allImagesHavePurpose = images.length > 0 && images.every((_, index) => isSet(formState.imagePurpose[index]))
    return mainFieldsFilled && allImagesHavePurpose
  }, [ formState, images ])

  const upload = useCallback(async () => {
    setUploadState('uploading')
    try {
      const folderName = `${capitalize(formState.firstName)}${capitalize(formState.lastName)}`
      await createFolder(folderName)
      await uploadFiles(folderName, images, formState)
      setImages([])
      formState.reset()
      setUploadState('success')
    } catch (err) {
      setErrorInformation(err.toString())
      setUploadState('failed')
      console.error('Failed to upload', err);
    }
  }, [ formState, images ])

  const addImages = useCallback((newImages) => {
    setImages([ ...images, ...newImages ])
  }, [ images ])

  return <div className="w-100" style={ { 'maxWidth': '920px' } }>
    <header className="d-flex justify-content-between mb-4">
      <span className="title">IxPhotoUploader</span>
      <div className="d-flex flex-row column-gap-4">
        <a href="#" onClick={() => formState.reset()}>Reset form</a>
        <a href="#" onClick={() => logout()}>Logout</a>
      </div>
    </header>
    { uploadState === 'pending' && <div>
      <form className="d-flex flex-column row-gap-4">
        <div className={ styles['form-inputs'] }>
          <label className="flex-grow-1">
            <span>Date</span>
            <input className="w-100" type="date" value={formState.date} onChange={(e) => formState.setDate(e.target.value)} />
          </label>
          <label className="flex-grow-1">
            <span>First name</span>
            <input className="w-100" type="text" autoComplete="off" value={formState.firstName} onBlur={(e) => formState.setFirstName(trimInput(e.target.value))} onChange={(e) => formState.setFirstName(e.target.value)} />
          </label>
          <label className="flex-grow-1">
            <span>Last name</span>
            <input className="w-100" type="text" autoComplete="off" value={formState.lastName} onBlur={(e) => formState.setLastName(trimInput(e.target.value))} onChange={(e) => formState.setLastName(e.target.value)} />
          </label>
        </div>
        <FileInput onImagesAdded={addImages} />
        <div id="image-previews" className="d-flex flex-column row-gap-4">
          { images.map((src, index) => <ImageCard key={index} index={index} src={src} onRemove={onRemove} />) }
        </div>
        <div className="d-flex flex-column gap-2 align-items-start">
          <button disabled={!isFormReady} className={styles['upload-button']} onClick={(e) => { e.preventDefault(); upload(); }}>Save photos</button>
          { isFormReady == false && <span className='text-danger'>* Please enter all fields before upload</span> }
        </div>
      </form>
    </div> }
    { uploadState === 'uploading' && <div>Uploading..</div>}
    { uploadState === 'success' && <div>
      <p>Upload completed!</p>
      <button onClick={() => setUploadState('pending')}>Continue</button>
    </div>
    }
    { uploadState === 'failed' && <div className="d-flex flex-column align-items-start">
        <p>The upload failed and we cannot say for sure why. Please send this information to the developer or admin:</p>
        <div className="mb-4">
          <code>{ errorInformation }</code>
        </div>
        <button onClick={() => setUploadState('pending')}>Try again</button>
      </div> }
  </div>
}