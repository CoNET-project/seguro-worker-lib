import { v4 as getUUIDv4 } from 'uuid'
import { Buffer } from 'buffer'
import { WorkerCommand } from './define'

const workerCros = (
    url: string
) => {
    const iss = `importScripts('${url}');`
    return URL.createObjectURL( new Blob([ iss ], { type: 'application/javascript' }))
}

export default class SubWorker {
    public worker: Worker
    private cmdArray: Map < string, ( cmd: WorkerCommand ) => void > = new Map()
    private catchReturn(
        message: string
    ) {

        const jsonData = Buffer.from( message ).toString()
        let cmd: WorkerCommand

        try {
            cmd = JSON.parse( jsonData )
        } catch ( ex ) {
            return console.dir( ex )
        }

        let getCallBack = null
        if ( cmd.uuid ) {
            getCallBack = this.cmdArray.get( cmd.uuid )
        }

        if ( !getCallBack ) {
            if ( /^ready$/i.test( cmd.cmd )) {
                return this.readyBack( cmd.data )
            }
            return console.log( `SubWorker catch unknow UUID sharedMainWorker Return: ${cmd} `)
        }

        return getCallBack( cmd )
    }

    constructor(
        url: string,
        portNumber: number,
        private readyBack: ( init: string ) => void
    ) {

        const localhost = process.env.NODE_ENV === 'development' ? 'http://localhost:3001/' : `http://localhost:${portNumber}/`

        const storageUrlBlob = workerCros( localhost + url )
        this.worker = new Worker( storageUrlBlob, { name: localhost })
        URL.revokeObjectURL( storageUrlBlob )
        this.worker.onmessage = (e) => {
            return this.catchReturn( e.data )
        }
        this.worker.onerror = (ev) => {
            console.log(ev )
        }
    }

    public append(
        _message: WorkerCommand,
        CallBack: ( cmd?: WorkerCommand ) => void
    ) {
        const message = {
            ..._message,
            uuid: getUUIDv4()
        }
        this.cmdArray.set( message.uuid, CallBack )
        const cmdStream = Buffer.from( JSON.stringify( message ))
        if ( this.worker?.postMessage ) {
            return this.worker.postMessage( cmdStream.buffer, [ cmdStream.buffer ] )
        }
        return console.log('SubWorker Error: this.worker have no Object!')

    }
}
