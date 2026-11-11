import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/tokens.css'
import './styles/tokens-admin.css'
import './styles/global.css'
import './styles/auth-base.css'
import './styles/temaEscuro.css'
import App from './app/App.jsx'
import AuthProvider from './features/auth/AuthProvider.jsx'
import ProvedorDeTema from './tema/ProvedorDeTema.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProvedorDeTema>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ProvedorDeTema>
  </StrictMode>,
)
