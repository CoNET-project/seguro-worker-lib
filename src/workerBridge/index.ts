export interface WorkerCommand {
    cmd: string
    data?: any
    uuid?: string
    err?: string
}

export type WorkerCallStatus = 'SUCCESS' | 'NOT_READY' | 'UNKNOWN_COMMAND'

export type HelloWorldResolve = [status: WorkerCallStatus, payload?: string]
