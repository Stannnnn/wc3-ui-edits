// Override defaults so we can add our hooks
let sockets = []
{
    sockets = []
    const nativeWebSocket = window.WebSocket
    window.WebSocket = function (...args) {
        const socket = new nativeWebSocket(...args)
        sockets.push(socket)
        return socket
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

    let friendGameActivityState = {}

    const initWebsocketHooks = () => {
        const orig = sockets[0].onmessage
        sockets[0].onmessage = (...args) => {
            orig(...args)

            let e = JSON.parse(args?.[0]?.data)

            switch (e?.messageType) {
                case 'FriendsFriendUpdated': {
                    const currentGame = e.payload.data.friend.localRichPresenceAttributes?.find(
                        a => a.key === 'currentGameName'
                    )

                    if (
                        currentGame?.value &&
                        currentGame.value !== friendGameActivityState[e.payload.data.friend.battleTag]
                    ) {
                        friendGameActivityState[e.payload.data.friend.battleTag] = currentGame?.value

                        sockets[0].onmessage({
                            data: JSON.stringify({
                                messageType: 'ChatMessage',
                                payload: {
                                    message: {
                                        content: `Your friend ${e.payload.data.friend.battleTag} entered a Warcraft III The Frozen Throne game called ${currentGame.value}`,
                                        type: 'message',
                                        sender: '',
                                    },
                                },
                            }),
                        })
                    }

                    friendGameActivityState[e.payload.data.friend.battleTag] = currentGame?.value

                    break
                }
            }
        }
    }
}

const countInputs = () => {
    return Array.from(document.getElementsByTagName('input')).filter(e => !e.classList.contains('chat_focus_ignore'))
}

setInterval(function () {
    // Forces the chat input to disable zoom (Zoom causes issues with auto scrolling down on new message). Also need to change the portals that apply to the ChatFrame
    for (let v of [
        ...document.getElementsByClassName('ChatFrame-Root'),
        ...document.getElementsByClassName('PlayerList-PopupMenu'),
    ]) {
        v.style.zoom = 'unset'
    }

    // Forces the chat input to stay focused
    let a = document.getElementById('chatPanelInput')

    if (a) {
        a.onblur = () => {
            if (countInputs().length === 1) {
                document.getElementById('chatPanelInput').focus()
            }
        }
    }
}, 1)
