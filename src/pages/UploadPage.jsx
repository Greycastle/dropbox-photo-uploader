import { useState, useCallback, useContext, useMemo } from 'react'
import capitalize from '@/services/capitalize'
import startUpload from '@/services/start-upload'
import FormContext from '@/state/form-context'

import ImageCard from '@/components/ImageCard'
import FileInput from '@/components/FileInput'
import UploadProgress from '@/components/UploadProgress'
import PageLayout from '@/components/PageLayout'

import styles from './UploadPage.module.css'
import { getUploadFolder } from '../state/upload-folder'

function trimInput(input) {
  return input.split(' ').map((part) => capitalize(part)).join('').trim();
}

export default function UploadPage() {
  const [images, setImages] = useState([])
  const [uploadState, setUploadState] = useState('pending')
  const [errorInformation, setErrorInformation] = useState(null)
  const [uploadTasks, setUploadTasks] = useState([])
  const uploadFolder = getUploadFolder()

  const onRemove = useCallback((index) => {
    const updated = [...images]
    updated.splice(index, 1)
    setImages(updated)
  }, [images])

  const formState = useContext(FormContext)

  const isFormReady = useMemo(() => {
    const isSet = (txt) => txt && txt.length > 0;
    const mainFieldsFilled = formState.date && isSet(formState.firstName) && isSet(formState.lastName)
    const allImagesHavePurpose = images.length > 0 && images.every((_, index) => isSet(formState.imagePurpose[index]))
    return mainFieldsFilled && allImagesHavePurpose
  }, [formState, images])

  const upload = useCallback(async () => {
    setUploadTasks([])
    setUploadState('uploading')
    try {
      const tasks = await startUpload(images, formState, uploadFolder)
      setUploadTasks(tasks)
      await Promise.all(tasks.map((task) => task.promise))
      setUploadState('success')
      setImages([])
      formState.reset()
    } catch (err) {
      setErrorInformation(err.toString())
      setUploadState('failed')
      console.error('Failed to upload', err);
    }
  }, [formState, images, uploadFolder])

  const addImages = useCallback((newImages) => {
    setImages([...images, ...newImages])
  }, [images])


  if (!uploadFolder) {
    location.hash = '#folder-selection'
    return
  }

  return <PageLayout>
    {uploadState === 'pending' && <div>
      <form className="d-flex flex-column row-gap-4">
        <div>
          <span style={{marginRight: '1rem'}}>Upload folder:</span><span><span style={{ marginRight: '0.5rem'}}>{ uploadFolder }</span>(<a href="#folder-selection">change</a>)</span>
        </div>
        <div className={styles['form-inputs']}>
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
          {images.map((image, index) => <ImageCard key={index} index={index} image={image} onRemove={onRemove} />)}
        </div>
        <div className="d-flex flex-column gap-2 align-items-start">
          <button disabled={!isFormReady} className={styles['upload-button']} onClick={(e) => { e.preventDefault(); upload(); }}>Save photos</button>
          {isFormReady == false && <span className='text-danger'>* Please enter all fields before upload</span>}
        </div>
      </form>
    </div>}
    {(uploadState === 'uploading' || uploadState === 'success') && <div>
      { uploadState === 'uploading' && <p>Uploading...</p> }
      <UploadProgress uploadTasks={uploadTasks} />
      {uploadState === 'success' && <div>
        <p>Upload completed!</p>
        <button onClick={() => setUploadState('pending')}>Continue</button>
      </div>
      }
    </div>}
    {uploadState === 'failed' && <div className="d-flex flex-column align-items-start">
      <p>The upload failed and we cannot say for sure why. Please send this information to the developer or admin:</p>
      <UploadProgress uploadTasks={uploadTasks} />
      <div className="mb-4">
        <code>{errorInformation}</code>
      </div>
      <button onClick={() => setUploadState('pending')}>Try again</button>
    </div>}
  </PageLayout>
}