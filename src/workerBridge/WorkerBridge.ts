import { WorkerCommand } from './define'
import SubWorker from './SubWorker'

export default class WorkerBridge {
    public workerBridgeClassReady = false
    public mainWorker
    public seguroInitData = ''
    public getSeguroInitData() {
        if ( this.workerBridgeClassReady ) {
            return this.seguroInitData
        }
        return null
    }

    public initSeguro() {
        return new Promise(() => {
            const cmd: WorkerCommand = {
                cmd: 'initSeguroData'
            }
            this.mainWorker.append( cmd, () => {})
        })
    }

    constructor(
        public callback: () => void
    ) {
        // eslint-disable-next-line no-restricted-globals
        const port = parseInt( process.env.NODE_ENV === 'development' ? '3001' : location.port || '3001', 10)
        this.mainWorker = new SubWorker( 'mainWorker.js', port, (init) => {
            this.workerBridgeClassReady = true
            this.seguroInitData = init
            return this.callback()
        })
    }
}
