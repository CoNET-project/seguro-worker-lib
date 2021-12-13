/* eslint-disable */

import SubWorker from './SubWorker'
import { logger } from './util'
import type * as Type from './index'

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
                return resolve(['SUCCESS', this.initUIMethod(data)])
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
                return resolve(['SUCCESS', this.initUIMethod(data)])
            })
            
        })
    }

    private initUIMethod(data: Type.ContainerData|null) {
        if ( !this.seguroInitDataTemp ) {
            if ( data ) {
                this.seguroInitDataTemp = data
            } else {
                logger (`initUIMethod have null of data and this.seguroInitDataTemp`)
                return 
            }
            
        }
        const sw = data ? data.passcode.status : this.seguroInitDataTemp?.passcode.status
        switch (sw) {
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
                this.seguroInitDataTemp.profile = data ? data.profile : { profiles: []}
                return this.seguroInitDataTemp
            }

            case 'UNLOCKED': {
                this.seguroInitDataTemp.passcode = {
                    status: 'UNLOCKED',
                    deletePasscode: this.deletePasscode,
                    lock: this.lock
                }
                this.seguroInitDataTemp.preferences = data ? data.preferences : {preferences: null}
                this.seguroInitDataTemp.preferences.storePreferences = this.storePreferences
                this.seguroInitDataTemp.profile = data ? data.profile : { profiles:[]}
                this.seguroInitDataTemp.profile.newProfile = this.newProfile
                this.seguroInitDataTemp.profile.storeProfile = this.storeProfile
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
                return resolve(['SUCCESS', this.initUIMethod(data)])
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
                return resolve(['SUCCESS', this.initUIMethod(data)])
            })
            
        })
    }

    private storePreferences = (): Promise < Type.StartWorkerResolve > => {
        return new Promise((
            resolve
        ) => {

            const cmd:Type.WorkerCommand = {
                cmd: 'storePreferences',
                data:[this.seguroInitDataTemp?.preferences.preferences]
            }
            return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    logger('storePreferences ERROR', err)
                    return resolve(['NOT_READY'])
                }
                return resolve(['SUCCESS'])

            })
        })
    }

    private newProfile = (profile: Type.profile): Promise < Type.StartWorkerResolve > => {
        return new Promise((
            resolve
        ) => {

            const cmd:Type.WorkerCommand = {
                cmd: 'newProfile',
                data:[profile]
            }

            return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    logger('newProfile ERROR', err)
                    return resolve(['NOT_READY'])
                }
                if ( _cmd.err ) {
                    return resolve(['SYSTEM_ERROR'])
                }
                return resolve(['SUCCESS', this.initUIMethod(_cmd.data[0])])
            })
        })
    }

    private storeProfile = (): Promise < Type.StartWorkerResolve > => {
        return new Promise((
            resolve
        ) => {

            const cmd:Type.WorkerCommand = {
                cmd: 'storeProfile',
                data: [this.seguroInitDataTemp?.profile.profiles]
            }

            return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    logger('storeProfile ERROR', err)
                    return resolve(['NOT_READY'])
                }
                if ( _cmd.err ) {
                    logger('storeProfile _cmd.err', _cmd.err )
                    return resolve(['SYSTEM_ERROR'])
                }
                return resolve(['SUCCESS'])
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
            let setup = this.initUIMethod(InitData)
            this.callback(['SUCCESS', setup])
            
            //         for TEST createPasscode
            // if ( setup ) {
            //     if ( setup.passcode.status === 'NOT_SET') {
            //         //@ts-ignore
            //         return setup.passcode.createPasscode('223344', (R,L) => {
            //             //logger (`process: [${ R }${L}]`)
            //         }).then(() => {
            //             logger('createPasscode SUCCESS', setup )
            //         })
            //     }
            // }
            
            // if ( setup?.passcode.status === 'NOT_SET') {
            //     return this.createPasscode('223344', (R,L) => {
            //         //logger (`process: [${ R }${L}]`)
            //     }).then(() => {
            //         logger('createPasscode SUCCESS', setup )
            //     })
            // }


            //      for TEST testPasscode
            
            // if ( setup?.passcode.status === 'LOCKED') {
            //     return this.testPasscode('223344', (pssL, pssR ) => {
            //         //return logger (`process: [${ pssL }][${pssR}]`)
            //     }).then(() => {
            //         logger('testPasscode SUCCESS!', setup)
            //         //return this.lock ()

            //     })
            //     // .then (n => {
            //     //     logger (`Lock success!`, n )
            //     // })
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
            // }

            // let setup: Type.ContainerData|undefined
            // //      test storePreferences
            // if ( this.seguroInitDataTemp?.passcode.status === 'LOCKED') {
            //     return this.testPasscode('223344', (pssL, pssR ) => {
            //         //return logger (`process: [${ pssL }][${pssR}]`)
            //     }).then((n) => {
            //         logger('testPasscode SUCCESS!', n)
            //         setup = n[1]
            //         const profile = this.seguroInitDataTemp?.profile.profiles[0]
            //         if ( profile ) {
            //             profile.alias = 'Carol'
            //             profile.nickname = 'Carol Yan'
            //             profile.tags = ['Kloak', 'woman']
            //             profile.nicknameMark = 'kkbb'
            //         }
                    
            //         if ( setup && setup.profile.storeProfile ) {
            //             return setup.profile.storeProfile ()
            //         }
            //         logger(`( setup && setup.profiles.newProfile) === null`)
            //         //@ts-ignore
            //         // this.seguroInitDataTemp?.preferences.preferences = {
            //         //     uuuu: 'sadcsacd',
            //         //     oooo: 'hgvhsjkdclas'
            //         // }
            //         // return this.storePreferences()

            //     })
            //     .then (n => {
                   
            //         logger (`storeProfile SUCCESS`)
            //         logger (this.seguroInitDataTemp)
            //     })
            //     // .then (n => {
            //     //     logger (`Lock success!`, n )
            //     // })
            // }
            
        })
    }

}
