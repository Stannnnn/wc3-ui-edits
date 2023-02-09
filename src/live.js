const initMain = () => {
    const scriptSrc = Array.from(document.getElementsByTagName('script')).find(s =>
        s.src.includes('wc3-ui-edits.js')
    )?.src

    const searchParams = new URLSearchParams(scriptSrc.substring(scriptSrc.indexOf('?')))

    const isEnabled = s => !['false', 'off', 'no', '0'].includes(s?.toLowerCase())

    const fixesEnabled = {
        friends: isEnabled(searchParams.get('friends')),
        chatFocus: isEnabled(searchParams.get('chatFocus')),
        chatScroll: isEnabled(searchParams.get('chatScroll')),
    }

    const sockets = []

    // Override defaults so we can add our hooks
    {
        // Doesn't work with W3C
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
        const a = setInterval(() => {
            if (sockets.length > 0) {
                clearInterval(a)
                initWebsocketHooks()
            }
        }, 1000)

        const friendGameActivityState = {}

        const handleFriendActivity = friend => {
            const currentGame = friend.localRichPresenceAttributes?.find(a => a.key === 'currentGameName')

            if (currentGame?.value && currentGame.value !== friendGameActivityState[friend.battleTag]) {
                friendGameActivityState[friend.battleTag] = currentGame?.value

                if (fixesEnabled.friends) {
                    sockets[0].onmessage({
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
                    })
                }
            }

            friendGameActivityState[friend.battleTag] = currentGame?.value
        }

        const initWebsocketHooks = () => {
            try {
                const orig = sockets[0].onmessage
                sockets[0].onmessage = (...args) => {
                    orig(...args)

                    try {
                        const e = JSON.parse(args?.[0]?.data)

                        switch (e?.messageType) {
                            case 'FriendsFriendUpdated': {
                                handleFriendActivity(e.payload.data.friend)
                                break
                            }

                            case 'FriendsFriendData': {
                                e.payload.data.friends.forEach(friend => handleFriendActivity(friend))
                                break
                            }
                        }
                    } catch (e) {
                        console.log('Error caught:', e)
                    }
                }
            } catch (e) {
                console.log('Error caught:', e)
            }
        }
    }

    const countInputs = () => {
        return Array.from(document.getElementsByTagName('input')).filter(
            e => !e.classList.contains('chat_focus_ignore')
        )
    }

    setInterval(() => {
        if (fixesEnabled.chatScroll) {
            // Forces the chat input to disable zoom (Zoom causes issues with auto scrolling down on new message). Also need to change the portals that apply to the ChatFrame
            for (const v of [
                ...document.getElementsByClassName('ChatFrame-Root'),
                ...document.getElementsByClassName('PlayerList-PopupMenu'),
            ]) {
                v.style.zoom = 'unset'
            }
        }

        if (fixesEnabled.chatFocus) {
            // Forces the chat input to stay focused
            const a = document.getElementById('chatPanelInput')

            if (a) {
                a.onblur = () => {
                    if (countInputs().length === 1) {
                        document.getElementById('chatPanelInput')?.focus()
                    }
                }
            }
        }
    }, 1)
}

initMain()
