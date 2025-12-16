import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'   // <- this must be present and exact

const root = createRoot(document.getElementById('root'))
root.render(<React.StrictMode><App /></React.StrictMode>)
