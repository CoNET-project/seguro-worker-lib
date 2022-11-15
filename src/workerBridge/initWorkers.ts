import WorkerBridge from './WorkerBridge'
import type { StartWorkerResolve } from './index'
import { logger } from './util'

export const startWorker = (): Promise < StartWorkerResolve > => {
    return new Promise((
        resolve
    ) => {
        logger('startWorker')
        const time = setTimeout(() => {
            return resolve(['TIME_OUT'])
        }, 30000)

        const ready = ( data: StartWorkerResolve) => {
            clearTimeout(time)
            resolve(data)
        }
        
        new WorkerBridge(ready)
    })
}
