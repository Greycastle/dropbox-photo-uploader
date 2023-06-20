import PropTypes from "prop-types"

import { logout } from '@/state/auth'

export default function PageLayout({ children, headerItems }) {
  return (
    <div className="w-100" style={{ 'maxWidth': '920px' }}>
    <header className="d-flex justify-content-between mb-4">
      <span className="title">IxPhotoUploader</span>
      <div className="d-flex flex-row column-gap-4">
        { headerItems !== undefined && headerItems }
        <a href="#" onClick={() => logout()}>Logout</a>
      </div>
    </header>
    <div>
      { children }
    </div>
    </div>
  )
}

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  headerItems: PropTypes.node,
}