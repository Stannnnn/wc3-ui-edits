import { useContext } from 'react'
import { LogsContext } from './LogContext'

export const useLogsContext = () => useContext(LogsContext)
