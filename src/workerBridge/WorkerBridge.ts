import SubWorker from './SubWorker'
import { logger } from './util'
import type * as Type from './index'
const envTest = process.env.NODE_ENV === 'development'
const localhost = `http://localhost:${envTest ? '3001' : window.location.port}/`
const helloPath = `${localhost}hello`

const helloWorld = ():Promise<Type.HelloWorldResolve> => new Promise((resolve) => fetch(helloPath)
    .then((response) => response.json())
    .then((data) => {
        return resolve(['SUCCESS', data])
    }).catch(() => {
        return resolve(['NOT_READY'])
    }))

export default class WorkerBridge {
    public encryptWorker
    public profiles: Type.profile[] = []
    public seguroInitDataTemp: Type.ContainerData | undefined = undefined

    private testPasscord = (
        passcode: string,
        progressCallback: ( progress: number ) => void
    ): Promise < Type.passcodeUnlockStatus > => {
        return new Promise((
            resolve
        ) => {
            const cmd:Type.WorkerCommand = {
                cmd: 'encrypt_TestPasscord',
                data: [passcode]
            }
            return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    return resolve(['FAILURE'])
                }
                const data = _cmd.data[0]
                if ( typeof data === 'number' ) {
                    return progressCallback(data)
                }
                this.seguroInitDataTemp = data
                return resolve(['SUCCESS', this.initUIMethod()])
            })
            
        })
    }

    private createPasscode = ( 
        passcode: string,
        progressCallback: ( progress: number ) => void
    ): Promise < Type.StartWorkerResolve > => {
        return new Promise((
            resolve
        ) => {
            const cmd:Type.WorkerCommand = {
                cmd: 'encrypt_createPasscode',
                data: [passcode, this.seguroInitDataTemp]
            }
            return this.encryptWorker.append(
                cmd, (err, _cmd) => {
                    if ( err ) {
                        logger('createPasscode ERROR', err)
                        return resolve(['NOT_READY'])
                    }
                    const data = _cmd.data[0]
                    if ( typeof data === 'number' ) {
                        return progressCallback(data)
                    }
                    this.seguroInitDataTemp = data
                    return resolve(['SUCCESS', this.initUIMethod()])
                }
            )
            
        })
    }

    private initUIMethod() {
        if ( !this.seguroInitDataTemp ) {
            logger('ERROR: have no this.seguroInitDataTemp')
            return undefined
        }

        switch (this.seguroInitDataTemp.passcode.status) {
            case 'NOT_SET': {
                this.seguroInitDataTemp.passcode = {
                    createPasscode: this.createPasscode,
                    status: 'NOT_SET'
                }
                return this.seguroInitDataTemp
            }
            case 'LOCKED': {
                this.seguroInitDataTemp.passcode = {
                    status: 'LOCKED',
                    testPasscode: this.testPasscord,
                    deletePasscode: this.deletePasscode
                }
                return this.seguroInitDataTemp
            }
            case 'UNLOCKED': {
                this.seguroInitDataTemp.passcode = {
                    status: 'UNLOCKED',
                    deletePasscode: this.deletePasscode,
                    lock: this.lock
                }
                return this.seguroInitDataTemp
            }
            default: {
                return this.seguroInitDataTemp
            }
        }
    }

    private lock = (): Promise < Type.StartWorkerResolve > => {
        return new Promise((
            resolve
        ) => {
            const cmd:Type.WorkerCommand = {
                cmd: 'encrypt_lock'
            }
            return this.encryptWorker.append(
                cmd, (err, _cmd) => {
                    if ( err ) {
                        logger('createPasscode ERROR', err)
                        return resolve(['NOT_READY'])
                    }
                    const data = _cmd.data[0]
                    this.seguroInitDataTemp = data
                    return resolve(['SUCCESS', this.initUIMethod()])
                }
            )
            
        })
    }

    private deletePasscode = (): Promise < Type.StartWorkerResolve > => {
        return new Promise((
            resolve
        ) => {
            const cmd:Type.WorkerCommand = {
                cmd: 'encrypt_deletePasscode'
            }
            return this.encryptWorker.append(
                cmd, (err, _cmd) => {
                    if ( err ) {
                        logger('createPasscode ERROR', err)
                        return resolve(['NOT_READY'])
                    }
                    const data = _cmd.data[0]
                    this.seguroInitDataTemp = data
                    return resolve(['SUCCESS', this.initUIMethod()])
                }
            )
            
        })
    }
    
    public encryptWorkerReady = false

    constructor(
        public callback: (init: Type.StartWorkerResolve ) => void
    ) {
        this.encryptWorker = new SubWorker('encrypt.js', (init: any | null ) => {
            this.encryptWorkerReady = true
            const [InitData] = init
            this.seguroInitDataTemp = InitData
            
            this.callback(['SUCCESS', this.initUIMethod()])
            
            //         for TEST 
            
            // if ( this.seguroInitDataTemp?.passcord.status === 'UNDEFINED') {
            //     return this.createPasscode('223344', () => {
            //         //logger (`process: [${ process }]`)
            //     }).then((data) => { 
            //         logger('createPasscode SUCCESS', data )
            //     }).catch( (ex) => {
            //         logger('createPasscode ERROR', ex )
            //     })
            // }
            
            // if ( this.seguroInitDataTemp?.passcord.status === 'LOCKED') {
            //     return this.testPasscord('223344', () => {
            //         //logger (`process: [${ process }]`)
            //     }).then((n) => {
            //         logger('testPasscord SUCCESS!', n)
            //         return this.lock ()

            //     })
            //     .then (n => {
            //         logger (`Lock success!`, n )
            //     })
            //     .catch((ex) => {
            //         logger('testPasscord Error', ex )
            //     })
            // }
            
        })
    }
    
    public helloWorld = () => helloWorld()

}
