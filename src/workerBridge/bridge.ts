import type workerBridge from './workerBridge'
export const getSeguroInitData = ( bridgeWorker: workerBridge | null ) => {
    if ( bridgeWorker ) {
        return bridgeWorker.seguroInitData
    }
    return null
}

export const initSeguroData = (
    password: string,
    
) => new Promise (( 
    resolve,
    reject
) => {

})