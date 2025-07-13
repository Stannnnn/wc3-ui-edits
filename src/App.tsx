import { useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import './App.scss'

export const App = () => {
    const [appVisible, setAppVisible] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Fallback to keyCode for Dead keys
            if (e.key === '`' || e.keyCode === 192) {
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

    const isEnabled = (s: string, defaultFalse?: boolean) => {
        if (defaultFalse && !s) {
            return false
        }

        return !['false', 'off', 'no', '0'].includes(s?.toLowerCase())
    }

    const [fixesEnabled, setFixesEnabled] = useState({
        friends: isEnabled(searchParams.get('friends') || ''),
        chat: isEnabled(searchParams.get('chat') || ''),
        friendlist: isEnabled(searchParams.get('friendlist') || ''),
        breakall: false, // isEnabled(searchParams.get('breakall') || ''),
        pausebg: isEnabled(searchParams.get('pausebg') || '', true),
    })

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

        let a: NodeJS.Timeout
        let orig: any

        // Setup websocket hooks
        {
            a = setInterval(() => {
                try {
                    if (window.sockets.length > 0) {
                        clearInterval(a)
                        initWebsocketHooks()
                    }
                } catch (e) {
                    console.error('Error caught:', e)
                }
            }, 1000)

            const friendGameActivityState: { [x: string]: string } = {}

            const handleFriendActivity = (friend: any) => {
                const currentGame = friend.localRichPresenceAttributes?.find((a: any) => a.key === 'currentGameName')

                if (currentGame?.value && currentGame.value !== friendGameActivityState[friend.battleTag]) {
                    friendGameActivityState[friend.battleTag] = currentGame?.value

                    if (fixesEnabled.friends) {
                        window.sockets[0].onmessage?.({
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
                orig = window.sockets[0].onmessage

                window.sockets[0].onmessage = async (...args) => {
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

            const videoDiv: HTMLVideoElement | null = document.querySelector('video#BackgroundVideo')

            if (videoDiv?.paused) {
                videoDiv.play()
            }

            a && clearInterval(a)
            orig && (window.sockets[0].onmessage = orig)
        }
    }, [fixesEnabled])

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
                                                                onClick={() => {
                                                                    setFixesEnabled(f => ({
                                                                        ...f,
                                                                        friends: !f.friends,
                                                                    }))
                                                                }}
                                                            ></div>
                                                            <div className="Checkbox-Label undefined">Friends</div>
                                                        </div>

                                                        <div className="Checkbox-Container">
                                                            <div
                                                                className={`Checkbox-Button-${
                                                                    fixesEnabled.chat ? 'Checked' : 'Unchecked'
                                                                }`}
                                                                onClick={() => {
                                                                    setFixesEnabled(f => ({
                                                                        ...f,
                                                                        chat: !f.chat,
                                                                    }))
                                                                }}
                                                            ></div>
                                                            <div className="Checkbox-Label undefined">Chat</div>
                                                        </div>

                                                        <div className="Checkbox-Container">
                                                            <div
                                                                className={`Checkbox-Button-${
                                                                    fixesEnabled.friendlist ? 'Checked' : 'Unchecked'
                                                                }`}
                                                                onClick={() => {
                                                                    setFixesEnabled(f => ({
                                                                        ...f,
                                                                        friendlist: !f.friendlist,
                                                                    }))
                                                                }}
                                                            ></div>
                                                            <div className="Checkbox-Label undefined">Friendlist</div>
                                                        </div>

                                                        {/* <div className="Checkbox-Container">
                                                            <div
                                                                className={`Checkbox-Button-${
                                                                    fixesEnabled.breakall ? 'Checked' : 'Unchecked'
                                                                }`}
                                                                onClick={() => {
                                                                    setFixesEnabled(f => ({
                                                                        ...f,
                                                                        breakall: !f.breakall,
                                                                    }))
                                                                }}
                                                            ></div>
                                                            <div className="Checkbox-Label undefined">Break All</div>
                                                        </div> */}

                                                        <div className="Checkbox-Container">
                                                            <div
                                                                className={`Checkbox-Button-${
                                                                    fixesEnabled.pausebg ? 'Checked' : 'Unchecked'
                                                                }`}
                                                                onClick={() => {
                                                                    setFixesEnabled(f => ({
                                                                        ...f,
                                                                        pausebg: !f.pausebg,
                                                                    }))
                                                                }}
                                                            ></div>
                                                            <div className="Checkbox-Label undefined">
                                                                Pause Background Videos
                                                            </div>
                                                        </div>

                                                        <div>
                                                            Settings can't be saved directly in Warcraft. Edit the URL
                                                            or check the GitHub page for details.
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
