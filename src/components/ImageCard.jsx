import { useCallback, useContext, useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import FormContext from '@/state/form-context'
import getFilename from '@/services/get-filename'

import styles from './ImageCard.module.css'

const nameLengthLimit = 120;

export default function ImageCard({ src, index, onRemove }) {
  const [ filename, setFilename ] = useState('')

  const formState = useContext(FormContext)

  useEffect(() => {
    const purpose = formState.imagePurpose[index] ?? ''
    setFilename(getFilename(index + 1, purpose, formState.firstName, formState.lastName, formState.date))
  }, [ index, formState ])

  const setPurpose = useCallback((purpose) => {
    formState.setImagePurpose({ ...formState.imagePurpose, [index]: purpose })
  }, [ index, formState ])

  const lengthExceeded = filename.length > nameLengthLimit

  return <div className={ 'card w-100 p-1 ' + styles['image-card'] }>
    <img src={src} />
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

ImageCard.propTypes = {
  src: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
}