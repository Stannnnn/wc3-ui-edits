import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'

const root = document.getElementById('root-edits')

if (root) {
    createRoot(root).render(
        <StrictMode>
            <App />
        </StrictMode>
    )
} else {
    console.error('Root element not found')
}
