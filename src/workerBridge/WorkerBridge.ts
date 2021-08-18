import SubWorker from './SubWorker'
import type { HelloWorldResolve, ContainerData } from './index'

const envTest = process.env.NODE_ENV === 'development'
const localhost = `http://localhost:${envTest ? '3001' : window.location.port}/`
const helloPath = `${localhost}hello`

const helloWorld = ():Promise<HelloWorldResolve> => new Promise((resolve) => fetch(helloPath)
    .then((response) => response.json())
    .then((data) => {
        return resolve(['SUCCESS', data])
    }).catch(() => {
        return resolve(['NOT_READY'])
    }))

export default class WorkerBridge {
    public encryptWorker
    public storageWorker
    public storageWorkerReady = false
    public encryptWorkerReady = false
    public seguroInitDataTemp: ContainerData | null = null
    
    private checkInitDone() {
        if ( this.storageWorkerReady && this.encryptWorkerReady ) {
            return this.callback(this.seguroInitDataTemp)
        }
    }

    constructor(
        public callback: (init: ContainerData| null) => void
    ) {
        this.encryptWorker = new SubWorker('encrypt.js', () => {
            return this.checkInitDone()
        })
        this.storageWorker = new SubWorker('storage.js', (init: ContainerData | null ) => {
            this.seguroInitDataTemp = init
            return this.checkInitDone()
        })
    }

    public helloWorld = () => helloWorld()
}
