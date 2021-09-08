import WorkerBridge from './WorkerBridge'
import * as bridge from './bridge'
import type { HelloWorldResolve, StartWorkerResolve } from './index'
import { logger } from './util'
let bridgeWorker: WorkerBridge

export const startWorker = (): Promise < StartWorkerResolve > => {
    return new Promise((
        resolve
    ) => {
        logger('startWorker')
        const time = setTimeout(() => {
            return resolve(['TIME_OUT'])
        }, 5000)

        const ready = ( data: StartWorkerResolve) => {
            clearTimeout(time)
            resolve(data)
        }
        
        bridgeWorker = new WorkerBridge(ready)
    })
}

export const helloWorld = (): Promise<HelloWorldResolve> | null => bridge.helloWorld(bridgeWorker)
