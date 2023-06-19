import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import TinySpinner from '@/components/TinySpinner'

export default function UploadProgress({ uploadTasks }) {
  const [ taskStates, setTaskStates ] = useState([])

  const updateItem = (index, value) => {
    setTaskStates((prev) => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  useEffect(() => {
    setTaskStates(uploadTasks.map(() => ({ state: 'pending', error: null })))
    for (let i = 0; i < uploadTasks.length; i++) {
      uploadTasks[i].promise
        .then(() => updateItem(i, { state: 'done' }))
        .catch((err) => updateItem(i, { state: 'failed', error: err }))
    }
  }, [uploadTasks])

  return <div className='mb-2'>
    {
      taskStates.length > 0 && uploadTasks.map((task, index) => {
        return <UploadItemDisplay key={index} name={task.name} state={taskStates[index].state} err={taskStates[index].error} />
      })
    }
  </div>
}

function UploadItemDisplay({ name, err, state }) {
  let icon = <TinySpinner />
  if (state === 'done') icon = <span>✅</span>
  if (state === 'failed') icon = <span>❌</span>
  return <div className='d-flex flex-row gap-2 align-items-center'>
    { icon } <span>{ name }</span> { err && <span>{err.toString()}</span> }
  </div>
}

UploadItemDisplay.propTypes = {
  name: PropTypes.string.isRequired,
  state: PropTypes.oneOf(['pending', 'done', 'failed']).isRequired,
  err: PropTypes.instanceOf(Error),
}

UploadProgress.propTypes = {
  uploadTasks: PropTypes.arrayOf(PropTypes.shape({
    promise: PropTypes.instanceOf(Promise),
    name: PropTypes.string,
  })).isRequired,
}
