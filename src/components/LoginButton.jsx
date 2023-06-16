import { login } from '@/state/auth';

export default function LoginButton() {
  return <button onClick={() => login()}>Connect DropBox</button>
}