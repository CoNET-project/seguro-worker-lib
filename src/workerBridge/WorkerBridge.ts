import { waterfall } from 'async'
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
                    return resolve(['NOT_READY'])
                }
                const data = _cmd.data[0]
                if ( typeof data ==='number' ) {
                    return progressCallback (data)
                }
                return resolve(['SUCCESS', data])
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
                data: [ passcode, this.seguroInitDataTemp ]
            }
            return this.encryptWorker.append(
                cmd, (err, _cmd) => {
                if ( err ) {
                    logger ('createPasscode ERROR', err)
                    return resolve(['NOT_READY'])
                }
                const data = _cmd.data[0]
                if ( typeof data ==='number' ) {
                    return progressCallback (data)
                }
                return resolve(['SUCCESS',this.seguroInitDataTemp = data])
            })
            
        })
    }

    private initContainerData() {
        if ( !this.seguroInitDataTemp ) {
            logger ('ERROR: have no this.seguroInitDataTemp')
            return undefined
        }
        if ( this.seguroInitDataTemp.passcord.status === 'UNDEFINED' ) {
            this.seguroInitDataTemp.passcord.createPasscode = this.createPasscode
        } else {
            this.seguroInitDataTemp.passcord.testPasscord = this.testPasscord
        }
        
        return this.seguroInitDataTemp
    }
    
    public encryptWorkerReady = false

    constructor(
        public callback: (init: Type.StartWorkerResolve ) => void
    ) {
        this.encryptWorker = new SubWorker('encrypt.js', (init: any | null ) => {
            this.encryptWorkerReady = true
            this.seguroInitDataTemp = init[0]
            
            const ret = this.initContainerData ()
            this.callback (['SUCCESS', ret])
            if ( this.seguroInitDataTemp?.passcord.status === 'UNDEFINED') {
                return this.createPasscode('223344', (process) => {
                    return //logger (`process: [${ process }]`)
                }).then ( n => {
                    logger (`createPasscode SUCCESS`, n )
                }).catch ( ex => {
                    logger (`createPasscode ERROR`, ex )
                })
            }

            if ( this.seguroInitDataTemp?.passcord.status === 'LOCKED') {
                return this.testPasscord ('223344', () => {

                }).then (n => {
                    logger (n)
                }).catch (ex => {
                    logger (`testPasscord Error`, ex )
                })
            }
            
            
        })
    }
    
    public helloWorld = () => helloWorld()

}
