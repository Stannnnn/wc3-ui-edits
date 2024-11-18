import { useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import './App.css'

export const App = () => {
    const [appVisible, setAppVisible] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '`') {
                e.preventDefault()

                setAppVisible(v => !v)
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (
        <>
            {appVisible && (
                <Draggable
                    bounds="#root"
                    handle=".header"
                    defaultPosition={{ x: 100, y: 100 }}
                    // defaultPosition={getValue('headerPosition', { x: 100, y: 100 })}
                    // onStop={(_e, data) => {
                    //     setValue('headerPosition', { x: data.x, y: data.y })
                    // }}
                >
                    <div className="debugWindow">
                        <div className="header">wc3-ui-edits</div>

                        <div className="body">
                            <input type="checkbox" />
                        </div>
                    </div>
                </Draggable>
            )}
        </>
    )
}

// Copy this for testing
// sockets[0].onmessage({
//     data: JSON.stringify({
//         messageType: 'SetGlueScreen',
//         payload: {
//             screen: 'GAME_LOBBY',
//         },
//     }),
// })

const initMain = () => {
    const fixesEnabled = {
        friends: true,
    }

    // Override defaults so we can add our hooks
    const sockets: WebSocket[] = window.sockets || []

    // For debugging
    window.sockets = sockets

    {
        const originalSend = WebSocket.prototype.send
        WebSocket.prototype.send = function (...args) {
            // Ignore Vite and Chii
            if (this.url.includes(':5173') || this.url.includes(':8080')) {
                return originalSend.call(this, ...args)
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
