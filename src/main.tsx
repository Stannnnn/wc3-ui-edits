import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { LogsContextProvider } from './Context/LogsContext/LogContext.tsx'

const root = document.getElementById('root-edits')

if (root) {
    createRoot(root).render(
        <StrictMode>
            <LogsContextProvider>
                <App />
            </LogsContextProvider>
        </StrictMode>
    )
} else {
    console.error('Root element not found')
}
