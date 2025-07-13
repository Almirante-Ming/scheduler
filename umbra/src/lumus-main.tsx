import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LumusApp from './LumusApp.tsx'

// Apply theme globally (remove dark for better visibility)
document.documentElement.classList.remove('dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LumusApp />
  </StrictMode>,
)
