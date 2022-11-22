export type WorkerCommandErrorType = 'NOT_READY'|'INVALID_DATA'|
'NO_UUID'|'INVALID_COMMAND'|'OPENPGP_RUNNING_ERROR'|
'PouchDB_ERROR'|'GENERATE_PASSCODE_ERROR'|'FAILURE'|'COUNTDOWN'

export type WorkerCommandType = 'READY'|'encrypt_TestPasscode'|
'encrypt_createPasscode'|'encrypt_lock'|'encrypt_deletePasscode'|'storePreferences'|
'newProfile'|'storeProfile'|'invitation'|'WORKER_MESSAGE'|
'isAddress'|'getFaucet'|'syncAsset'|'sendAsset'|'getUSDCPrice'|
'buyUSDC'|'mintCoNETCash'|'getSINodes'

export type WorkerCallStatus = 'SUCCESS' | 'NOT_READY' | 'UNKNOWN_COMMAND' |
'TIME_OUT' | 'SYSTEM_ERROR'
export type PasscodeStatus = 'LOCKED' | 'UNLOCKED' | 'NOT_SET'
export type ColorTheme = 'LIGHT' | 'DARK'
export type Language = 'en-CA' | 'fr-CA' | 'ja-JP' | 'zh-CN' | 'zh-TW'
export type secondVerificationValume = '1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'
export type SeguroNetworkStatus = WorkerCallStatus | 
'TIMEOUT_EMAIL_SERVER' | 'TIMEOUT_SEGURO_NETWORK' |
'NO_INTERNET' | 'CONNECTING_ACCESS_POINT' |
'CONNECTING_SEGURO_NETWORK'|'INIT'|'NOT_STRIPE'|
'LOCAL_SERVER_ERROR'|'INVITATION_CODE_ERROR'|
'SEGURO_ERROR'|'UNKNOW_ERROR'|'SEGURO_DATA_FORMAT_ERROR'

/*eslint-disable */
export interface profile {
    bio: string
    nickname: string
    keyID?: string
    tags: string[]
    alias: string
    isPrimary: boolean
    profileImg: string
}

export type passcodeUnlockStatus = 
    [status: 'FAILURE' | 'COUNTDOWN' | WorkerCallStatus, payload?: ContainerData]

export type SINodesSortby = 'CUSTOMER_REVIEW'|'TOTAL_ONLINE_TIME'|
	'STORAGE_PRICE_LOW'|'STORAGE_PRICE_HIGH'|'OUTBOUND_PRICE_HIGH'|'OUTBOUND_PRICE_LOW'
	
export type SINodesRegion = 'USA'|'UK'|'ES'|'DE'

export interface ContainerData {
    method: {
        testPasscode?: (
            passcode: string,
            progressCallback: ( progressInteger: string, progressFractional: string ) => void
        ) => Promise <passcodeUnlockStatus>
        createPasscode?: (
            passcode: string,
            progressCallback: ( progressInteger: string, progressFractional: string ) => void
        ) => Promise <[WorkerCallStatus, ContainerData?]>
        deletePasscode?: () => Promise <[WorkerCallStatus, ContainerData?]>
        lock?: () => Promise <[WorkerCallStatus, ContainerData?]>
        storePreferences?: () => Promise <[WorkerCallStatus, ContainerData?]>
        newProfile?: (profile: profile) => Promise<StartWorkerResolve>
        storeProfile?: () => Promise<StartWorkerResolve>
		isAddress?: (address: string) => Promise <StartWorkerResolve>
		getFaucet?: (address: string) => Promise <StartWorkerResolve>
		syncAsset?: () => Promise<StartWorkerResolve>
		sendAsset?: (sendAddr: string, total: number, toAddr: string, asset: string ) => Promise<StartWorkerResolve>
		getUSDCPrice?: () => Promise<StartWorkerResolve>
		buyUSDC?: (conetVal: number, keyID: string) => Promise<StartWorkerResolve>
		mintCoNETCash?: (usdcVal: number, keyID: string ) => Promise<StartWorkerResolve>
		getSINodes?: (sortby: SINodesSortby, region: SINodesRegion) => Promise < StartWorkerResolve >
    }
    status: PasscodeStatus
    data: any
    preferences: any
}

export interface WorkerCommand {
    cmd: WorkerCommandType
    data?: any
    uuid?: string
    err?: WorkerCommandErrorType
}

export type CreatePasscodeResolve = 
    [status: WorkerCallStatus, updateProgress?: ( percentage: number ) => void ]

export type StartWorkerResolve = [WorkerCallStatus, ContainerData?]
