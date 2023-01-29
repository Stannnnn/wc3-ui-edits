const fancyDebugWindow = document.createElement('div')
fancyDebugWindow.id = 'FANCY_DEBUG_WINDOW'
fancyDebugWindow.style.zIndex = 100000000
fancyDebugWindow.style.position = 'absolute'
fancyDebugWindow.style.width = '600px'
fancyDebugWindow.style.height = '400px'
fancyDebugWindow.style.resize = 'both'
fancyDebugWindow.style.overflow = 'scroll'
fancyDebugWindow.style.backgroundColor = 'gray'
fancyDebugWindow.style.top = '100px'
fancyDebugWindow.style.left = '100px'
document.body.appendChild(fancyDebugWindow)

const fancyDebugWindowHeader = document.createElement('div')
fancyDebugWindowHeader.id = 'FANCY_DEBUG_WINDOWheader'
fancyDebugWindowHeader.innerHTML = 'console.log'
fancyDebugWindowHeader.style.width = '100%'
fancyDebugWindow.appendChild(fancyDebugWindowHeader)

const fancyDebugWindowSubHeader = document.createElement('div')
fancyDebugWindowSubHeader.style.width = '100%'
fancyDebugWindow.appendChild(fancyDebugWindowSubHeader)

const fancyDebugWindowBody = document.createElement('div')
fancyDebugWindowBody.innerHTML = 'HELLO WORLD'
fancyDebugWindowBody.style.width = '100%'
fancyDebugWindow.appendChild(fancyDebugWindowBody)

{
    const evalInput = document.createElement('input')
    evalInput.classList.add('chat_focus_ignore')
    evalInput.onkeyup = e => {
        if (e.key === 'Enter') {
            eval(evalInput.value)
            evalInput.value = ''
        }
    }
    fancyDebugWindowSubHeader.appendChild(evalInput)

    // Location refresh works but it doesn't load the default WC3 page
    //     const refreshBtn = document.createElement('button')
    //     refreshBtn.innerHTML = 'Refresh'
    //     refreshBtn.onclick = () => location.reload()
    //     fancyDebugWindowHeader.appendChild(refreshBtn)

    // dont think theres an option for default screen tho
    // {
    //     "messageType": "SetGlueScreen",
    //     "payload": {
    //         "screen": "GAME_LOBBY"
    //     }
    // }
}

// Simple drag library
{
    function dragElement(elmnt) {
        var pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0
        if (document.getElementById(elmnt.id + 'header')) {
            // if present, the header is where you move the DIV from:
            document.getElementById(elmnt.id + 'header').onmousedown = dragMouseDown
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            elmnt.onmousedown = dragMouseDown
        }

        function dragMouseDown(e) {
            e = e || window.event
            e.preventDefault()
            // get the mouse cursor position at startup:
            pos3 = e.clientX
            pos4 = e.clientY
            document.onmouseup = closeDragElement
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag
        }

        function elementDrag(e) {
            e = e || window.event
            e.preventDefault()
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX
            pos2 = pos4 - e.clientY
            pos3 = e.clientX
            pos4 = e.clientY
            // set the element's new position:
            elmnt.style.top = elmnt.offsetTop - pos2 + 'px'
            elmnt.style.left = elmnt.offsetLeft - pos1 + 'px'
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null
            document.onmousemove = null
        }
    }
}

dragElement(document.getElementById('FANCY_DEBUG_WINDOW'))

// Override defaults so we can add our hooks
let sockets = []
{
    window.console.origLog = window.console.log
    window.console.log = (...args) => {
        window.console.origLog('log', ...args)
        window.onLogHandler?.(...args)
    }

    sockets = []
    const nativeWebSocket = window.WebSocket
    window.WebSocket = function (...args) {
        const socket = new nativeWebSocket(...args)
        sockets.push(socket)
        return socket
    }
}

let logCalls = []

window.onLogHandler = (...args) => {
    logCalls.unshift(...args)
    logCalls = logCalls.slice(0, 500)

    newHtml = location.href + '<br />' + logCalls.join('<br />')

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

    fancyDebugWindowBody.innerHTML = newHtml
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

setInterval(() => {
    // Forces the chat input to disable zoom (Zoom causes issues with auto scrolling down on new message). Also need to change the portals that apply to the ChatFrame
    for (let v of [
        ...document.getElementsByClassName('ChatFrame-Root'),
        ...document.getElementsByClassName('PlayerList-PopupMenu'),
    ]) {
        v.style.zoom = 'unset'
    }

    // Forces the chat input to stay focused
    const countInputs = () => {
        return Array.from(document.getElementsByTagName('input')).filter(
            e => !e.classList.contains('chat_focus_ignore')
        )
    }

    let a = document.getElementById('chatPanelInput')

    if (a) {
        a.onblur = () => {
            if (countInputs().length === 1) {
                document.getElementById('chatPanelInput')?.focus()
            }
        }
    }
}, 1)
