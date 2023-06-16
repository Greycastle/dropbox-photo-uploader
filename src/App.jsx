import AppAuthentication from '@/components/AppAuthentication';
import UploadPage from '@/pages/UploadPage';
import FormContextProvider from '@/components/FormContextProvider';


export default function App() {
  return <AppAuthentication>
    <FormContextProvider>
      <UploadPage />
    </FormContextProvider>
  </AppAuthentication>
}