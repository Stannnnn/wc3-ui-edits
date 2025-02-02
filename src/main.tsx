import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'

// Placed at the very start so that we can intercept all WebSocket connections
{
    // Override defaults so we can add our hooks
    window.sockets = window.sockets || []

    const originalSend = WebSocket.prototype.send
    WebSocket.prototype.send = function (...args) {
        // Ignore Vite and Chii
        if (this.url.includes(':5173') || this.url.includes(':8080')) {
            return originalSend.call(this, ...args)
        }

        if (window.sockets.indexOf(this) === -1) window.sockets.push(this)
        return originalSend.call(this, ...args)
    }
}

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
