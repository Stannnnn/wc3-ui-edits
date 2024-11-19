import { useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import './App.scss'

export const App = () => {
    const [appVisible, setAppVisible] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '`') {
                e.preventDefault()

                setAppVisible(v => !v)
            }

            if (e.key === 'Escape' && document.querySelector('.debugWindow.visible')) {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
                setAppVisible(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    const scriptSrc =
        Array.from(document.getElementsByTagName('script')).find(
            s => s.src.includes('wc3-ui-edits/assets/index.js') || s.src.includes('src/main.tsx')
        )?.src || ''

    const searchParams = new URLSearchParams(scriptSrc.substring(scriptSrc.indexOf('?')))

    const isEnabled = (s: string) => !['false', 'off', 'no', '0'].includes(s?.toLowerCase())

    const fixesEnabled = {
        friends: isEnabled(searchParams.get('friends') || ''),
        chat: isEnabled(searchParams.get('chat') || ''),
        friendlist: isEnabled(searchParams.get('friendlist') || ''),
        breakall: isEnabled(searchParams.get('breakall') || ''),
        pausebg: !isEnabled(searchParams.get('pausebg') || ''),
    }

    useEffect(() => {
        if (fixesEnabled.chat) {
            document.getElementsByTagName('body')[0].classList.add('fix_chat')
        }

        if (fixesEnabled.friendlist) {
            document.getElementsByTagName('body')[0].classList.add('fix_friendlist')
        }

        if (fixesEnabled.breakall) {
            document.getElementsByTagName('body')[0].classList.add('fix_breakall')
        }

        const onPlayEvent = (e: any) => {
            if (e.target.tagName === 'VIDEO') {
                e.target.pause()
            }
        }

        if (fixesEnabled.pausebg) {
            document.getElementsByTagName('body')[0].classList.add('fix_pausebg')
            document.addEventListener('play', onPlayEvent, true)
            document.querySelector('video')?.pause()
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

        return () => {
            document
                .getElementsByTagName('body')[0]
                .classList.remove('fix_chat', 'fix_friendlist', 'fix_breakall', 'fix_pausebg')

            document.removeEventListener('play', onPlayEvent, true)
        }
    }, [])

    return (
        <>
            {appVisible && (
                <Draggable
                    bounds="#root"
                    handle=".Options-MenuItem-Selected"
                    defaultPosition={{ x: 100, y: 100 }}
                    // defaultPosition={getValue('headerPosition', { x: 100, y: 100 })}
                    // onStop={(_e, data) => {
                    //     setValue('headerPosition', { x: data.x, y: data.y })
                    // }}
                >
                    <div className={'debugWindow' + (appVisible ? ' visible' : '')}>
                        <div className="Options-Zoom-Container">
                            <div className="Options-Container Animate-In">
                                <div className="Options-Background"></div>
                                <div className="BaseFrame">
                                    <div className="left-chain tft"></div>
                                    <div className="right-chain tft"></div>
                                    <div className="frame tft"></div>
                                    <div className="background-texture"></div>
                                </div>
                                <div className="Options-Header-HolderBackground">
                                    <div className="Options-Header-Holder-Left">
                                        <div className="Lionhead"></div>
                                        <div className="Lionhead-Back"></div>
                                    </div>
                                    <div className="Options-MenuItem-WrapperSpacing"></div>
                                    <div className="Options-Header-Holder-Right">
                                        <div className="Lionhead"></div>
                                        <div className="Lionhead-Back"></div>
                                    </div>
                                </div>
                                <div className="Options-Content Trackless-Scrollbar">
                                    <div className="Options-Menu">
                                        <div className="Options-Header-Holder">
                                            <div className="Options-MenuItem-Wrapper">
                                                <div className="Options-MenuItem-Button-Wrapper" data-action="tooltip">
                                                    <div className="Primary-Tab-Button-Top-Container">
                                                        <div
                                                            className="Primary-Button Options-MenuItem Options-MenuItem-Selected"
                                                            id=""
                                                        >
                                                            <div className="Primary-Button-Content">
                                                                <div>
                                                                    <span>wc3-ui-edits</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="Focus-State-BG"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="Options-Header-Holder-Right"></div>
                                        </div>
                                    </div>
                                    <div className="Options-Frame">
                                        <div className="Options-ConfigurationHolder">
                                            <div className="VideoOptions">
                                                <div className="VideoOptions-MainHolder">
                                                    <div className="body">
                                                        <div>Current settings:</div>

                                                        <div className="Checkbox-Container">
                                                            <div
                                                                className={`Checkbox-Button-${
                                                                    fixesEnabled.friends ? 'Checked' : 'Unchecked'
                                                                }`}
                                                            ></div>
                                                            <div className="Checkbox-Label undefined">Friends</div>
                                                        </div>

                                                        <div className="Checkbox-Container">
                                                            <div
                                                                className={`Checkbox-Button-${
                                                                    fixesEnabled.chat ? 'Checked' : 'Unchecked'
                                                                }`}
                                                            ></div>
                                                            <div className="Checkbox-Label undefined">Chat</div>
                                                        </div>

                                                        <div className="Checkbox-Container">
                                                            <div
                                                                className={`Checkbox-Button-${
                                                                    fixesEnabled.friendlist ? 'Checked' : 'Unchecked'
                                                                }`}
                                                            ></div>
                                                            <div className="Checkbox-Label undefined">Friendlist</div>
                                                        </div>

                                                        <div className="Checkbox-Container">
                                                            <div
                                                                className={`Checkbox-Button-${
                                                                    fixesEnabled.breakall ? 'Checked' : 'Unchecked'
                                                                }`}
                                                            ></div>
                                                            <div className="Checkbox-Label undefined">Break All</div>
                                                        </div>

                                                        <div className="Checkbox-Container">
                                                            <div
                                                                className={`Checkbox-Button-${
                                                                    fixesEnabled.pausebg ? 'Checked' : 'Unchecked'
                                                                }`}
                                                            ></div>
                                                            <div className="Checkbox-Label undefined">
                                                                Pause Background Videos
                                                            </div>
                                                        </div>

                                                        <div>
                                                            Unfortunately you can't change these settings directly in
                                                            warcraft, see the github page for more info.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
