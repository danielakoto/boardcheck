import { Toaster } from 'react-hot-toast';
import { App } from './App'

import './styles/Root.scss'

function Root() {
  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
        className: '',
        duration: 3000,
        style: {
          background: 'var(--bg)',
          color: 'var(--text)',
          boxShadow: 'var(--box-shadow)'
        }}}
      />
      <App />
    </>
  )
}

export default Root
