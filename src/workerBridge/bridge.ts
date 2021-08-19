import type workerBridge from './WorkerBridge'
export const helloWorld = ( bridgeWorker: workerBridge | null ) => {
    if ( bridgeWorker ) {
        return bridgeWorker.helloWorld()
    }
    return null
}
