import { v4 as getUUIDv4 } from 'uuid'
import { Buffer } from 'buffer'
import { workerCommand } from './index'
const workerCros = ( 
    url: string 
) => {
    const iss = `importScripts('${url}');`
    return URL.createObjectURL(new Blob([iss], { type: 'application/javascript' }))
}

export default class SubWorker {
    public worker: Worker
    private cmdArray: Map < string, (cmd: workerCommand) => void > = new Map()
    private catchReturn( 
        message: string 
    ) {
        const jsonData = Buffer.from(message).toString()
        let cmd: workerCommand

        try {
            cmd = JSON.parse(jsonData)
        } catch (ex) {
            /* eslint-disable no-console */
            return console.log(ex)
            /* eslint-enable no-console */
        }

        let getCallBack = null
        if (cmd.uuid) {
            getCallBack = this.cmdArray.get(cmd.uuid)
        }

        if (!getCallBack) {
            if (/^ready$/i.test(cmd.cmd)) {
                return this.readyBack(cmd.data)
            }
            /* eslint-disable no-console */
            return console.log(`SubWorker catch unknow UUID sharedMainWorker Return: ${cmd} `)
            /* eslint-enable no-console */
        }

        return getCallBack(cmd)
    }

    constructor( 
        url: string,
        portNumber: number,
        private readyBack: (init: string) => void 
    ) {
        const envTest = process.env.NODE_ENV === 'development'
        const localhost = envTest ? 'http://localhost:3001/' : `http://localhost:${portNumber}/`

        const storageUrlBlob = workerCros(localhost + url)
        this.worker = new Worker(storageUrlBlob, { name: localhost })
        URL.revokeObjectURL(storageUrlBlob)
        this.worker.onmessage = (e) => {
            return this.catchReturn(e.data)
        }
        this.worker.onerror = (ev) => {
            /* eslint-disable no-console */
            console.log(ev)
            /* eslint-enable no-console */
        }
    }

    public append(
        message: workerCommand,
        CallBack: (cmd?: workerCommand) => void 
    ) {
        const message1 = message
        message1.uuid = getUUIDv4()
        this.cmdArray.set(message1.uuid, CallBack)
        const cmdStream = Buffer.from(JSON.stringify(message1))
        if (this.worker?.postMessage) {
            return this.worker.postMessage(cmdStream.buffer, [cmdStream.buffer])
        }
        /* eslint-disable no-console */
        return console.log('SubWorker Error: this.worker have no Object!')
        /* eslint-enable no-console */
    }
}
