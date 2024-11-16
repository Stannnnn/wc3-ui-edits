import { useEffect, useRef, useState } from 'react'
import './App.css'
import { dragElement } from './simpleDrag'

export const App = () => {
    const [logs, setLogs] = useState<string[]>([])
    const debugRef = useRef<HTMLDivElement>(null)
    const dragRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const onLogHandler = (...args: string[]) => {
            let logCalls = logs
            logCalls.unshift(...args)
            logCalls = logCalls.slice(0, 500)

            // sockets[0].onmessage({
            //     data: JSON.stringify({
            //         messageType: 'ChatMessage',
            //         payload: {
            //             message: {
            //                 auroraId: 2,
            //                 channelId: '1717403302-1575413517-6996',
            //                 channelName: 'stormwind',
            //                 channelNumber: 2,
            //                 content: 'bacon is my guide',
            //                 sender: 'JoeyJoeJoe#1563',
            //                 source: 1,
            //                 type: 'message',
            //             },
            //         },
            //     }),
            // })

            setLogs([location.href, ...logCalls])
        }

        const origLogg = window.console.log
        window.console.log = (...args) => {
            origLogg('log', ...args)
            onLogHandler?.(...args)
        }
    }, [])

    useEffect(() => {
        if (debugRef.current && dragRef.current) {
            dragElement(debugRef.current, dragRef.current)
        }
    }, [])

    return (
        <>
            <div className="debugWindow" ref={debugRef}>
                <div className="header" ref={dragRef}></div>
                {logs.map((log, index) => (
                    <div key={index}>{JSON.stringify(log)}</div>
                ))}
            </div>
        </>
    )
}

const initMain = () => {
    const fixesEnabled = {
        friends: true,
    }

    // Override defaults so we can add our hooks
    let sockets: WebSocket[] = []
    {
        sockets = []
        // const nativeWebSocket = window.WebSocket
        // window.WebSocket = function (...args) {
        //     const socket = new nativeWebSocket(...args)
        //     sockets.push(socket)
        //     return socket
        // }

        const originalSend = WebSocket.prototype.send
        WebSocket.prototype.send = function (...args) {
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

        const friendGameActivityState: any = {}

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

                try {
                    await fetch('http://localhost:8080/postMessage', {
                        method: 'post',
                        body: JSON.stringify(e),
                        headers: { 'Content-Type': 'application/json' },
                    })
                } catch (e) {
                    console.error(e)
                }

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
