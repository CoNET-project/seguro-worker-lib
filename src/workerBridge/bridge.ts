import type workerBridge from './WorkerBridge'
export const getSeguroInitData = (bridgeWorker: workerBridge | null) => {
    if (bridgeWorker) {
        return bridgeWorker.seguroInitData
    }
    return null
}
export const helloWorld = ( bridgeWorker: workerBridge | null ) => {
    if ( bridgeWorker ) {
        return bridgeWorker.helloWorld()
    }
    return null
}
