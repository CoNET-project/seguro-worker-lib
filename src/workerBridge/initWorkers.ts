import WorkerBridge from './WorkerBridge'
import * as bridge from './bridge'
import type { HelloWorldResolve, StartWorkerResolve } from './index'
let bridgeWorker: WorkerBridge

export const startWorker = (): Promise < StartWorkerResolve > => {
    return new Promise((
        resolve
    ) => {
        const time = setTimeout(() => {
            return resolve(['TIME_OUT'])
        }, 10000)

        const ready = () => {
            clearTimeout(time)
            
            resolve(['SUCCESS'])
        }

        bridgeWorker = new WorkerBridge(ready)

    })
}

export const helloWorld = (): Promise<HelloWorldResolve> | null => bridge.helloWorld(bridgeWorker)
