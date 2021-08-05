import type WorkerBridge from './WorkerBridge'
export const getSeguroInitData = ( bridgeWorker: WorkerBridge | null ) => {
    if ( bridgeWorker ) {
        return bridgeWorker.getSeguroInitData()
    }
    return null
}

// export const initSeguroData = (
//     password: string
// ) => new Promise((
//     resolve,
//     reject
// ) => {
//
// })
