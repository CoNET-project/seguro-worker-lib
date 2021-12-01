/* eslint-disable */

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

    private testPasscode = (
        passcode: string,
        progressCallback: ( progressInteger: string, progressFractional: string ) => void
    ): Promise < Type.passcodeUnlockStatus > => {
        return new Promise((
            resolve
        ) => {
            const cmd:Type.WorkerCommand = {
                cmd: 'encrypt_TestPasscode',
                data: [passcode]
            }
            return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    return resolve(['FAILURE'])
                }
                const data = _cmd.data[0]
                if ( typeof data === 'number' ) {
                    const t = data * 100
                    const u = Math.round(t - 0.5)
                    let p = t - u - 0.005
                    p = p < 0 ? 0 : p
                    return progressCallback(u.toString(), p.toFixed(2))
                }
                this.seguroInitDataTemp = data
                return resolve(['SUCCESS', this.initUIMethod()])
            })
            
        })
    }

    private createPasscode = ( 
        passcode: string,
        progressCallback: ( progressInteger: string, progressFractional: string ) => void
    ): Promise < Type.StartWorkerResolve > => {
        return new Promise((
            resolve
        ) => {
            const cmd:Type.WorkerCommand = {
                cmd: 'encrypt_createPasscode',
                data: [passcode, this.seguroInitDataTemp]
            }
            return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    logger('createPasscode ERROR', err)
                    return resolve(['NOT_READY'])
                }
                const data = _cmd.data[0]
                if ( typeof data === 'number' ) {
                    const t = (data * 100)
                    const u = Math.round(t - 0.5)
                    let p = t - u - 0.005
                    p = p < 0 ? 0 : p
                    return progressCallback(u.toString(), p.toFixed(2))
                }
                this.seguroInitDataTemp = data
                return resolve(['SUCCESS', this.initUIMethod()])
            })
            
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
                    testPasscode: this.testPasscode,
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
            return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    logger('Lock ERROR', err)
                    return resolve(['NOT_READY'])
                }
                const data = _cmd.data[0]
                this.seguroInitDataTemp = data
                return resolve(['SUCCESS', this.initUIMethod()])
            })
            
        })
    }

    private deletePasscode = (): Promise < Type.StartWorkerResolve > => {
        return new Promise((
            resolve
        ) => {
            const cmd:Type.WorkerCommand = {
                cmd: 'encrypt_deletePasscode'
            }
            return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    logger('deletePasscode ERROR', err)
                    return resolve(['NOT_READY'])
                }
                const data = _cmd.data[0]
                this.seguroInitDataTemp = data
                return resolve(['SUCCESS', this.initUIMethod()])
            })
            
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
            
            //         for TEST createPasscode
            
            // if ( this.seguroInitDataTemp?.passcode.status === 'NOT_SET') {
            //     return this.createPasscode('223344', (R,L) => {
            //         logger (`process: [${ R }${L}]`)
            //     }).then((data) => { 
            //         logger('createPasscode SUCCESS', data )
            //     }).catch( (ex) => {
            //         logger('createPasscode ERROR', ex )
            //     })
            // }

            //      for TEST testPasscode
            
            // if ( this.seguroInitDataTemp?.passcode.status === 'LOCKED') {
            //     return this.testPasscode('223344', (pssL, pssR ) => {
            //         return logger (`process: [${ pssL }][${pssR}]`)
            //     }).then((n) => {
            //         logger('testPasscode SUCCESS!', n)
            //         //return this.lock ()

            //     })
            //     // .then (n => {
            //     //     logger (`Lock success!`, n )
            //     // })
            //     .catch((ex) => {
            //         logger('testPasscode Error', ex )
            //     })
            // }

            //      for TEST deletePasscode
            
            // if ( this.seguroInitDataTemp?.passcode.status === 'LOCKED') {
            //     return this.testPasscode('223344', () => {
            //         //logger (`process: [${ process }]`)
            //     }).then((n) => {
            //         logger('testPasscode SUCCESS!', n)
            //         return this.lock ()
            //     })
            //     .then (n => {
            //         logger (`Lock success!`, n )
            //         return this.deletePasscode ()
            //     })
            //     .then (n => {
            //         logger (`deletePasscode success!`, n )
            //     })
            //     .catch((ex) => {
            //         logger('TEST deletePasscode Error', ex )
            //     })
            // }
            
        })
    }
    
    public helloWorld = () => helloWorld()

}
