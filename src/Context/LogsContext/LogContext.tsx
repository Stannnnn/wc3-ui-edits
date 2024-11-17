import { Hook, Unhook } from 'console-feed'
import { Message } from 'console-feed/lib/definitions/Console'
import { createContext, ReactNode, useEffect, useRef, useState } from 'react'

type InitialState = ReturnType<typeof useInitialState>

const useInitialState = () => {
    const [logs, setLogs] = useState<Message[]>([])
    const ref = useRef<HTMLDivElement>(null)
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false)

    // run once!
    useEffect(() => {
        const hookedConsole = Hook(
            window.console,
            log => {
                if (ref.current) {
                    setIsScrolledToBottom(ref.current.scrollHeight - ref.current.scrollTop === ref.current.clientHeight)
                }

                const limit = 800

                return setLogs(currLogs => {
                    return [...currLogs.slice(-(limit - 1)), log]
                })
            },
            false
        )

        return () => {
            Unhook(hookedConsole)
        }
    }, [])

    useEffect(() => {
        if (isScrolledToBottom && ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight
            setIsScrolledToBottom(false)
        }
    }, [isScrolledToBottom])

    return { logs, ref }
}

export const LogsContext = createContext<InitialState>({} as InitialState)

export const LogsContextProvider = ({ children }: { children: ReactNode }) => {
    const initialState = useInitialState()

    return <LogsContext.Provider value={initialState}>{children}</LogsContext.Provider>
}
