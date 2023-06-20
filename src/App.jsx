import { useState
 } from 'react';
import AppAuthentication from '@/components/AppAuthentication';
import FormContextProvider from '@/components/FormContextProvider';

import UploadPage from '@/pages/UploadPage';
import FolderSelection from '@/pages/FolderSelection';

export default function App() {
  const [ pageRoute, setPageRoute ] = useState(window.location.hash)

  window.addEventListener('hashchange', () => {
    setPageRoute(window.location.hash)
  })

  let page = <UploadPage />
  if (pageRoute === '#folder-selection') {
    page = <FolderSelection />
  }

  return <AppAuthentication>
    <FormContextProvider>
      { page }
    </FormContextProvider>
  </AppAuthentication>
}