import SubWorker from './SubWorker'
import type { workerCommand } from './index'
export default class WorkerBridge {
    public workerBridgeClassReady = false
    public mainWorker
    public seguroInitDataTemp = ''
    get seguroInitData() {
        if (this.workerBridgeClassReady) {
            return this.seguroInitDataTemp
        }
        return null
    }

    // public initSeguro() {
    //     return new Promise(() => {
    //         const cmd: worker_command = {
    //             cmd: 'initSeguroData'
                
    //         }
    //         this.mainWorker.append(cmd, (cmd) => {
                
    //         })
    //     })
    // }

    constructor( 
        public callback: () => void 
    ) {
        const testEnv = process.env.NODE_ENV === 'development'
        const portText = testEnv ? '3001' : window.location.port || '3001'
        const port = parseInt(portText, 10)
        this.mainWorker = new SubWorker( 'mainWorker.js', port, (init) => {
            this.workerBridgeClassReady = true
            this.seguroInitDataTemp = init
            return this.callback()
        })
    }

    public helloWorld () {
        const cmd: workerCommand = {
            cmd: 'helloWorld'
        }
        return new Promise((resolve, reject) =>
            this.mainWorker.append (cmd, response => {
                if (!response) {
                    return reject ( new Error ('Workers have no response!'))
                }
                if (response.err) {
                    return reject ( new Error (response.err))
                }
                return resolve ( response )
            })
        )
    }
}
