import WorkerBridge from './WorkerBridge'
import * as bridge from './bridge'

let bridgeWorker: WorkerBridge | null = null

export const startWorker = () => {
    return new Promise((
        resolve,
        reject
    ) => {
        const time = setTimeout(() => {
            return reject(new Error('Worker Factory Timeout Error!'))
        }, 5000)

        const ready = () => {
            clearTimeout(time)

            if (!bridgeWorker?.getSeguroInitData()) {
                return bridgeWorker?.initSeguro().then((data) => {
                    console.log(data)
                    return resolve(null)
                })
            }
            resolve(null)
        }
        bridgeWorker = new WorkerBridge(ready)
    })
}

export const getSeguroInitData = () => bridge.getSeguroInitData(bridgeWorker)
