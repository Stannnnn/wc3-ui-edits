import copy from 'copy-to-clipboard'
import { useEffect, useRef, useState } from 'react'
import './App.css'
import { LogsContainer } from './LogsContainer'
import { dragElement } from './simpleDrag'

export const App = () => {
    const debugRef = useRef<HTMLDivElement>(null)
    const dragRef = useRef<HTMLDivElement>(null)

    const [appVisible, setAppVisible] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (debugRef.current && dragRef.current) {
            dragElement(debugRef.current, dragRef.current)
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '`') {
                e.preventDefault()

                setAppVisible(!appVisible)
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    })

    return (
        <>
            {appVisible && (
                <div className="debugWindow" ref={debugRef}>
                    <div
                        className="header"
                        ref={dragRef}
                        onClick={() => {
                            copy(location.href)
                        }}
                    >
                        {location.href}
                    </div>

                    <LogsContainer />

                    <input
                        className="message"
                        type="text"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && message.trim()) {
                                console.info(message)

                                try {
                                    eval(message)
                                } catch (e) {
                                    console.error(e)
                                }

                                setMessage('')
                            }
                        }}
                    />
                </div>
            )}
        </>
    )
}

const initMain = () => {
    const fixesEnabled = {
        friends: true,
    }

    // Override defaults so we can add our hooks
    const sockets: WebSocket[] = []

    {
        // const nativeWebSocket = window.WebSocket
        // window.WebSocket = function (...args) {
        //     const socket = new nativeWebSocket(...args)
        //     sockets.push(socket)
        //     return socket
        // }

        const originalSend = WebSocket.prototype.send
        WebSocket.prototype.send = function (...args) {
            // Ignore Vite
            if (this.url.includes(':5173')) {
                return
            }

            if (sockets.indexOf(this) === -1) sockets.push(this)
            return originalSend.call(this, ...args)
        }
    }

    // Setup websocket hooks
    {
        let a = setInterval(() => {
            try {
                if (sockets.length > 0) {
                    clearInterval(a)
                    initWebsocketHooks()
                }
            } catch (e) {
                console.log('Error caught:', e)
            }
        }, 1000)

        const friendGameActivityState: { [x: string]: string } = {}

        const handleFriendActivity = (friend: any) => {
            const currentGame = friend.localRichPresenceAttributes?.find((a: any) => a.key === 'currentGameName')

            if (currentGame?.value && currentGame.value !== friendGameActivityState[friend.battleTag]) {
                friendGameActivityState[friend.battleTag] = currentGame?.value

                if (fixesEnabled.friends) {
                    sockets[0].onmessage?.({
                        data: JSON.stringify({
                            messageType: 'ChatMessage',
                            payload: {
                                message: {
                                    content: `Your friend ${friend.battleTag} entered a game called ${currentGame.value}`,
                                    type: 'message',
                                    sender: '',
                                },
                            },
                        }),
                    } as any)
                }
            }

            friendGameActivityState[friend.battleTag] = currentGame?.value
        }

        const initWebsocketHooks = () => {
            const orig: any = sockets[0].onmessage
            sockets[0].onmessage = async (...args) => {
                orig?.(...args)

                let e = JSON.parse(args?.[0]?.data)

                switch (e?.messageType) {
                    case 'FriendsFriendUpdated': {
                        handleFriendActivity(e.payload.data.friend)
                        break
                    }

                    case 'FriendsFriendData': {
                        e.payload.data.friends.forEach((friend: any) => handleFriendActivity(friend))
                        break
                    }
                }
            }
        }
    }
}

initMain()
