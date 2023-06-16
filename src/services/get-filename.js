import capitalize from './capitalize'

export default function getFilename(index, purpose, firstName, lastName, date) {
  const datePart = date.replaceAll('-', '')
  const namePart = `${capitalize(firstName)}${capitalize(lastName)}`
  const purposePart = purpose.replaceAll(' ', '_')
  return `${datePart}.${namePart}.${purposePart}.${index}.jpg`
}