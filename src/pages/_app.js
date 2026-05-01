import { useEffect } from 'react'
import { AuthProvider } from '../context/AuthContext'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, [])

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
