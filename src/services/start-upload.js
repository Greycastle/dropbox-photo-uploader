import uploadFile from './upload-file'
import getFilename from './get-filename'
import createFolder from './create-folder'
import capitalize from './capitalize'

export default async function startUpload(images, formState, parentFolder) {
  const folderName = `${capitalize(formState.firstName)}.${capitalize(formState.lastName)}`
  await createFolder(folderName)

  return images.map((image, index) => {
    const purpose = formState.imagePurpose[index] ?? '_'
    const filename = getFilename(purpose, formState.firstName, formState.lastName, formState.date, image.filename)
    const path = `${parentFolder}/${folderName}/${filename}`
    return { name: filename, promise: uploadFile(path, image.data) }
  })
}