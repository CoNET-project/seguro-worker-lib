export interface WorkerCommand {
    cmd: string
    data?: any
    uuid?: string
    err?: string
}

export type WorkerCallStatus = 'SUCCESS' | 'NOTREADY' | 'UNKNOW_COMMAND'

export type HelloWorkResolve = [status: WorkerCallStatus, payload?: string]
