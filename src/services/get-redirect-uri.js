export default function getRedirectURI() {
  return window.location.origin + window.location.pathname + '?authenticated=true';
}