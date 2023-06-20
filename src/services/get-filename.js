import capitalize from './capitalize'

export default function getFilename(purpose, firstName, lastName, date, filename) {
  const datePart = date.replaceAll('-', '')
  const namePart = `${capitalize(firstName)}.${capitalize(lastName)}`
  const purposePart = (purpose || '').replaceAll(' ', '_')
  return `${datePart}.${namePart}.${purposePart}.${filename}`
}