import uploadFile from './upload-file'
import getFilename from './get-filename'

export default async function uploadFiles(folderName, images, formState) {
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