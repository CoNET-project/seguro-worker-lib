import subworker from './SubWorker'


export default class workerBridge {
    public workerBridgeClassReady = false
    public mainWorker
    public _seguroInitData = ''
    get seguroInitData () {
        if ( this.workerBridgeClassReady ) {
            return this._seguroInitData
        }
        return null
    }

    public initSeguro () {
        return new Promise (( resolve, reject ) => {
            const cmd: worker_command = {
                cmd: 'initSeguroData',
                
            }
            this.mainWorker.append ( cmd, cmd => {
                
            })
        })
    }

    constructor ( 
        public callback: () => void 
    ){
        const port = parseInt ( process.env.NODE_ENV === 'development' ? '3001': location.port || '3001')
        this.mainWorker = new subworker ( 'mainWorker.js',  port, init => {
            this.workerBridgeClassReady = true
            this._seguroInitData = init
            return this.callback ()
        })
    }
}