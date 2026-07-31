import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyAppearanceSettings } from './lib/theme'
import { getSettings } from './lib/storage'

// Vor dem ersten Render anwenden, damit Dark Mode/Animationen nicht kurz falsch aufblitzen.
applyAppearanceSettings(getSettings())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
