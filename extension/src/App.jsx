
import { Toaster } from 'react-hot-toast';
import { KeyboardApp } from './KeyboardApp'

import './App.scss'

function App() {
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
        }}}
      />
      <KeyboardApp />
    </>
  )
}

export default App
