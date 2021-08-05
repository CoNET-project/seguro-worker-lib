import workerBridge from './workerBridge'
import * as bridge from './bridge'

let bridgeWorker: workerBridge | null = null

export const startWorker = () => {
	return new Promise (( 
            resolve,
            reject
        ) => {
            const ready = () => {
                clearTimeout ( time )
                
                if ( !bridgeWorker?.seguroInitData ) {
                    return bridgeWorker?.initSeguro().then ( data => {
                        console.log ( data )
                        return resolve ( null )
                    })
                    
                }
                resolve ( null )
		    }
            bridgeWorker = new workerBridge ( ready )
        
            const time = setTimeout (() => {
                return reject ( new Error ('Worker Factory Timeout Error!'))
            }, 5000 )
	    })
}

export const getSeguroInitData = () => bridge.getSeguroInitData ( bridgeWorker )
