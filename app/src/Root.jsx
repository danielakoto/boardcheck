
import { Toaster } from 'react-hot-toast';
import { App } from './App'

import './index.css'
import './styles/Root.scss'

function Root() {
  return (
    <>
      <Toaster
        position="bottom-left"
        toastOptions={{
        className: '',
        duration: 4000,
        style: {
          background: 'var(--bg)',
          color: 'var(--text)',
        }}}
      />
      <App />
    </>
  )
}

export default Root
