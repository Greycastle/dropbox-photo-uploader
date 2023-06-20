import { useState, useEffect } from "react"
import PropTypes from "prop-types"

import FormContext from "@/state/form-context"

function getTodaysDate() {
  var local = new Date();
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toJSON().slice(0,10);
}

export default function FormContextProvider({ children }) {
  const [ date, setDate ] = useState(sessionStorage.getItem('form_date') ?? getTodaysDate())
  const [ firstName, setFirstName ] = useState(sessionStorage.getItem('form_firstName') ?? '')
  const [ lastName, setLastName ] = useState(sessionStorage.getItem('form_lastName') ?? '')
  const [ imagePurpose, setImagePurpose ] = useState({})

  useEffect(() => {
    sessionStorage.setItem('form_date', date)
    sessionStorage.setItem('form_firstName', firstName)
    sessionStorage.setItem('form_lastName', lastName)
  }, [ date, firstName, lastName ])

  const reset = () => {
    setImagePurpose({})
    setDate(getTodaysDate())
    setFirstName('')
    setLastName('')
  }

  const state = {
    date,
    firstName,
    lastName,
    setDate,
    setFirstName: setFirstName,
    setLastName: setLastName,
    imagePurpose,
    setImagePurpose,
    reset
  }

  return <FormContext.Provider value={state}>
    { children }
  </FormContext.Provider>
}

FormContextProvider.propTypes = {
  children: PropTypes.node.isRequired
}