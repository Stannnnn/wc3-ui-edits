export {}

declare global {
    interface Window {
        sockets?: WebSocket[]
    }
}
