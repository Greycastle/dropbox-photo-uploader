import getRedirectURI from '@/services/get-redirect-uri.js';

export default function LoginButton() {
  const connect = () => {
    localStorage.removeItem('photo_uploader_token')
    const redirectUri = encodeURIComponent(getRedirectURI());
    const clientId = '4l2igbdm2itulbo';
    const url = `https://www.dropbox.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    window.location = url;
  }

  return <button onClick={() => connect()}>Connect DropBox</button>
}