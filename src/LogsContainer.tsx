import { Console } from 'console-feed'
import { useLogsContext } from './Context/LogsContext/useLogsContext'

export const LogsContainer = () => {
    const { logs, ref } = useLogsContext()

    return (
        <div ref={ref} className="body">
            <Console logs={logs as any} variant="dark" />
        </div>
    )
}
