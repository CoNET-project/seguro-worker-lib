/* eslint-disable */

import SubWorker from './SubWorker'
import { logger } from './util'
import type * as Type from './index'



export default class WorkerBridge {
    public encryptWorker
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
                const data: any = _cmd.data[0]
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

	private isAddress = ( address: string ): Promise < Type.StartWorkerResolve >  => {
		return new Promise((
            resolve
        ) => {
			const cmd:Type.WorkerCommand = {
                cmd: 'isAddress',
                data: [address]
            }
			return this.encryptWorker.append(cmd, (err, _cmd) => {
				if ( err ) {
                    logger('createPasscode ERROR', err)
                    return resolve(['NOT_READY'])
                }
				return resolve(['SUCCESS', _cmd.data[0]])
			})
		})
	}

	private mintCoNETCash = (usdcVal: number, keyID: string): Promise<Type.StartWorkerResolve> => {
		return new Promise((
            resolve
        ) => {
			const cmd:Type.WorkerCommand = {
                cmd: 'mintCoNETCash',
                data: [[usdcVal, keyID]]
            }
			return this.encryptWorker.append(cmd, (err, _cmd) => {
				if ( err ) {
                    logger('createPasscode ERROR', err)
                    return resolve(['NOT_READY'])
                }
				return resolve(['SUCCESS', _cmd.data[0]])
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
                const data = _cmd.data[0]||null
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

    private invitation = (
        code: string
    ): Promise < Type.SeguroNetworkStatus > => {
        return new Promise((
            resolve
        ) => {
            const cmd:Type.WorkerCommand = {
                cmd: 'invitation',
                data: [code]
            }
            return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    logger('invitation ERROR', err.message )
                    //@ts-ignore
                    return resolve(err.message)
                }
                const data = _cmd.data[0]
                this.initUIMethod(data)
                return resolve('SUCCESS')
            })
            
        })
    }

	private syncAsset = (): Promise < Type.StartWorkerResolve >  => {
		return new Promise((
            resolve
        ) => {
			const cmd:Type.WorkerCommand = {
                cmd: 'syncAsset',
                data: []
            }
			return this.encryptWorker.append(cmd, (err, _cmd) => {
				if ( err ) {
                    logger('syncAsset ERROR', err)
                    return resolve(['NOT_READY'])
                }
				if (this.seguroInitDataTemp)
				this.seguroInitDataTemp.data = _cmd.data[0]
				return resolve(['SUCCESS'])
			})
		})
	}

    private initUIMethod(data: any) {
        if ( !this.seguroInitDataTemp ) {
            if ( !data || !data.passcode ) {
				logger (`initUIMethod have null of data and this.seguroInitDataTemp`)
                return
			}

        	this.seguroInitDataTemp = {
				method:{},
				data: data,
				status: data.passcode.status,
				preferences: data.preferences
			}
        }
		this.seguroInitDataTemp.data = data
        this.seguroInitDataTemp.preferences = data.preferences
		const sw = this.seguroInitDataTemp.status = data.passcode.status
        switch (sw) {
            case 'NOT_SET': {
                this.seguroInitDataTemp.method = {
					createPasscode: this.createPasscode
                }
				
                return this.seguroInitDataTemp
            }

            case 'LOCKED': {
                this.seguroInitDataTemp.method = {
					testPasscode: this.testPasscode,
					deletePasscode: this.deletePasscode
                }
                return this.seguroInitDataTemp
            }

            case 'UNLOCKED': {
                this.seguroInitDataTemp.method = {
                    deletePasscode: this.deletePasscode,
                    lock: this.lock,
					storePreferences: this.storePreferences,
					newProfile: this.newProfile,
					storeProfile: this.storeProfile,
					isAddress: this.isAddress,
					getFaucet: this.getFaucet,
					syncAsset: this.syncAsset,
					sendAsset: this.sendAsset,
					getUSDCPrice: this.getUSDCPrice,
					buyUSDC: this.buyUSDC,
					mintCoNETCash: this.mintCoNETCash,
					getSINodes: this.getSINodes,
					getRecipientCoNETCashAddress: this.getRecipientCoNETCashAddress
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
                const data:any = _cmd.data[0]
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
			if ( !this.seguroInitDataTemp ) {
				return resolve(['NOT_READY']) 
			}
            const cmd:Type.WorkerCommand = {
                cmd: 'storePreferences',
                data:[this.seguroInitDataTemp.preferences]
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
                data: [this.seguroInitDataTemp?.data.profiles]
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

	private getFaucet = (walletAddr: string ): Promise < Type.StartWorkerResolve > => {
		return new Promise((
            resolve
        ) => {
			const cmd:Type.WorkerCommand = {
                cmd: 'getFaucet',
                data: [walletAddr]
            }

            return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    logger('getFaucet ERROR', err)
                    return resolve(['NOT_READY'])
                }
                if ( _cmd.err ) {
                    logger('getFaucet _cmd.err', _cmd.err )
                    return resolve(['SYSTEM_ERROR'])
                }
                return resolve(['SUCCESS'])
            })
		})
	}

	private sendAsset = (sendAddr: string, total: number, toAddr: string, asset: string ): Promise < Type.StartWorkerResolve > => {
		return new Promise((
            resolve
        ) => {
			const cmd:Type.WorkerCommand = {
                cmd: 'sendAsset',
                data: [[sendAddr, total, toAddr, asset]]
            }
			return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    logger('sendAsset ERROR', err)
                    return resolve(['NOT_READY'])
                }
                if ( _cmd.err ) {
                    logger('sendAsset _cmd.err', _cmd.err )
                    return resolve(['SYSTEM_ERROR'])
                }
                return resolve(['SUCCESS'])
            })
		})
	}

	private getRecipientCoNETCashAddress = (amount: number): Promise < Type.StartWorkerResolve > => {
		return new Promise((
            resolve
        ) => {
			const cmd:Type.WorkerCommand = {
                cmd: 'getRecipientCoNETCashAddress',
                data: []
            }
			return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    logger('getRecipientCoNETCashAddress ERROR', err)
                    return resolve(['NOT_READY'])
                }
                if ( _cmd.err ) {
                    logger('sendAsset _cmd.err', _cmd.err )
                    return resolve(['SYSTEM_ERROR'])
                }

                return resolve(['SUCCESS',  _cmd.data[0]])
            })
		})
	}

	private getUSDCPrice = (): Promise < Type.StartWorkerResolve > => {
		return new Promise((
            resolve
        ) => {
			const cmd:Type.WorkerCommand = {
                cmd: 'getUSDCPrice',
                data: []
            }
			return this.encryptWorker.append(cmd, (err, _cmd) => {
                if ( err ) {
                    logger('sendAsset ERROR', err)
                    return resolve(['NOT_READY'])
                }
                if ( _cmd.err ) {
                    logger('sendAsset _cmd.err', _cmd.err )
                    return resolve(['SYSTEM_ERROR'])
                }

                return resolve(['SUCCESS',  _cmd.data[0]])
            })
		})
	}

	private buyUSDC = (conetVal: number, keyID: string ): Promise < Type.StartWorkerResolve > => {
		return new Promise((
            resolve
        ) => {
			const cmd:Type.WorkerCommand = {
                cmd: 'buyUSDC',
                data: [[conetVal, keyID]]
            }
			return this.encryptWorker.append(cmd, (err: any, _cmd: any) => {
                if ( err ) {
                    logger('sendAsset ERROR', err)
                    return resolve(['NOT_READY'])
                }
                if ( _cmd.err ) {
                    logger('sendAsset _cmd.err', _cmd.err )
                    return resolve(['SYSTEM_ERROR'])
                }

                return resolve(['SUCCESS',  _cmd.data[0]])
            })
		})
	}

	private getSINodes = (sortby: Type.SINodesSortby, region: Type.SINodesRegion): Promise < Type.StartWorkerResolve > => {
		return new Promise (resolve => {
			const _cmd: Type.WorkerCommand = {
                cmd: 'getSINodes',
                data: [[sortby, region]]
            }
			return this.encryptWorker.append(_cmd, (err: any, _cmd: any) => {
                if ( err ) {
                    logger('sendAsset ERROR', err)
                    return resolve(['NOT_READY'])
                }
                if ( _cmd.err ) {
                    logger('sendAsset _cmd.err', _cmd.err )
                    return resolve(['SYSTEM_ERROR'])
                }

                return resolve(['SUCCESS',  _cmd.data[0]])
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
            //     if ( setup.passcode.createPasscode ) {
            //         return setup.passcode.createPasscode('223344', (R,L) => {
            //             //logger (`process: [${ R }${L}]`)
            //         }).then(() => {
            //             logger('createPasscode SUCCESS', setup )
            //         })
            //     }
            //     return logger (`!setup.passcode.createPasscode`)
            // }


            //      for TEST invitation
            
            // if ( setup?.passcode.status === 'NOT_SET') {
            //     if ( setup.passcode.createPasscode ) {
            //         return setup.passcode.createPasscode('223344', (R,L) => {
            //             //logger (`process: [${ R }${L}]`)
            //         }).then(() => {
            //             logger('createPasscode SUCCESS', setup )
            //         })
            //     }
            //     return logger (`!setup.passcode.createPasscode`)
            // }

            // if ( setup?.passcode.status === 'LOCKED') {
            //     if ( setup.passcode.testPasscode ) {
            //         return setup.passcode.testPasscode('223344', (pssL, pssR ) => {
            //             //return logger (`process: [${ pssL }][${pssR}]`)
            //         }).then((status) => {
            //             logger('testPasscode SUCCESS!', setup)
            //             if ( setup?.SeguroNetwork.invitation ) {
            //                 return setup?.SeguroNetwork.invitation ('C11A6BDB-4230-430E-AD5C-D36196BF2F70')
            //             }
            //             logger (`! setup?.seguroNetwork.invitation`)
            //         }).then( status => {
            //             if ( status !== 'SUCCESS') {
            //                 return logger('setup?.SeguroNetwork.invitation ERROR', status )
            //             }
            //             logger ('setup?.SeguroNetwork.invitation SUCCESS', setup)
            //         })
            //     }
                
            //    return logger (`!setup.passcode.testPasscode`)
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
            
        }, message => {
            const data: Type.ContainerData = message.data[0]
            if ( !data ) {
                return logger (`SubWorker encrypt.js sent a null data!`)
            }
            if (!this.seguroInitDataTemp) {
                logger (`this.seguroInitDataTemp is NULL ERROR!`)
                return logger (`Message from SubWorker encrypt.js `, data )
            }
            logger (`WorkerBridge have message`)
			logger (data)
        })
    }

}
