import { v4 as getUUIDv4 } from 'uuid'
import { Buffer } from 'buffer'
import { WorkerCommand, ContainerData } from './index'
import { logger } from './util'
const workerCros = (
    url: string
) => {
    const iss = `importScripts('${url}');`
    return URL.createObjectURL(new Blob([iss], { type: 'application/javascript' }))
}

export default class SubWorker {
    public worker: Worker
    private cmdArray: 
    Map < string, (err: Error|null, cmd: WorkerCommand) => void > = new Map()
    private catchReturn(
        message: string
    ) {
        const jsonData = Buffer.from(message).toString()
        let cmd: WorkerCommand

        try {
            cmd = JSON.parse(jsonData)
        } catch (ex) {
            return logger('Calss SubWorker catchReturn JSON.parse(jsonData) err!', jsonData)
        }

        let getCallBack = null
        if (cmd?.uuid) {
            getCallBack = this.cmdArray.get(cmd.uuid)
        }

        if (!getCallBack) {
            if (cmd.cmd === 'READY') {
                return this.readyBack(cmd.data)
            }

            if ( cmd.cmd === 'WORKER_MESSAGE') {
                this.workerMessage(cmd.data)
                return logger('SubWorker got Message from Worker')
            }

            return logger(`SubWorker catch unknow UUID sharedMainWorker Return: ${cmd}`)
        }
        if ( cmd?.err ) {
            return getCallBack(new Error(cmd.err), cmd)
        }

        return getCallBack(null, cmd)
    }

    constructor(
        public url: string,
        private readyBack: (init: ContainerData) => void,
        private workerMessage: (message: WorkerCommand ) => void
    ) {
        const envTest = process.env.NODE_ENV === 'development'
        let localhost = window.location.href
        if (envTest) {
            localhost = localhost.replace('3000', '3001')
        }
        
        const storageUrlBlob = workerCros(localhost + url)
        this.worker = new Worker(storageUrlBlob, { name: localhost })
        URL.revokeObjectURL(storageUrlBlob)
        this.worker.onmessage = (e) => {
            return this.catchReturn(e.data)
        }
        this.worker.onerror = (ev) => {
            logger(ev)
        }
    }

    public append(
        message: WorkerCommand,
        CallBack: (err: Error|null, cmd: WorkerCommand) => void
    ) {
        const message1 = message
        message1.uuid = getUUIDv4()
        this.cmdArray.set(message1.uuid, CallBack)
        const cmdStream = Buffer.from(JSON.stringify(message1))
        if (this.worker?.postMessage) {
            return this.worker.postMessage(cmdStream.buffer, [cmdStream.buffer])
        }

        return logger('SubWorker Error: this.worker have no Object!')
    }
}
