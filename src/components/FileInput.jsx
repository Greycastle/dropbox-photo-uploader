import { useCallback } from 'react'
import PropTypes from 'prop-types'
import { useDropzone } from 'react-dropzone'
import joinClasses from '@/services/join-classes'
import styles from './FileInput.module.css'

async function loadImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      console.log(`filename = ${file.name}`)
      resolve({ data: reader.result, filename: file.name })
    };

    reader.readAsDataURL(file);
  })
}

export default function FileInput({ onImagesAdded }) {

  const onDrop = useCallback(async (files) => {
    const images = await Promise.all(Array.from(files).map(loadImage))
    onImagesAdded(images)
  }, [ onImagesAdded ])

  const acceptFileTypes = {
    'image/jpeg': [],
    'image/png': []
  }

  const {getRootProps, getInputProps, isDragActive} = useDropzone({ onDrop, accept: acceptFileTypes })

  const classes = joinClasses([ styles['file-drop-area'], isDragActive ? styles['is-active'] : null ])
  return <div className={ classes } { ...getRootProps() }>
    <input { ...getInputProps() } />
    { isDragActive ? <span>Drop to upload!</span> : <span>Press or drag files for upload here</span> }
  </div>
}

FileInput.propTypes = {
  onImagesAdded: PropTypes.func.isRequired
}