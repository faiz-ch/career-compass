import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { suppressDevelopmentWarnings } from './utils/suppressWarnings'

// Suppress development warnings that don't affect functionality
suppressDevelopmentWarnings();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
