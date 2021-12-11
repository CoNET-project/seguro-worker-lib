export type WorkerCommandErrorType = 'NOT_READY'|'INVALID_DATA'|
'NO_UUID'|'INVALID_COMMAND'|'OPENPGP_RUNNING_ERROR'|
'PouchDB_ERROR'|'GENERATE_PASSCODE_ERROR'|'FAILURE'|'COUNTDOWN'

export type WorkerCommandType = 'READY'|'encrypt_TestPasscode'|
'encrypt_createPasscode'|'encrypt_lock'|'encrypt_deletePasscode'|'storePreferences'|
'newProfile'|'storeProfile'

export type WorkerCallStatus = 'SUCCESS' | 'NOT_READY' | 'UNKNOWN_COMMAND' |
'TIME_OUT' | 'SYSTEM_ERROR'
export type PasscodeStatus = 'LOCKED' | 'UNLOCKED' | 'NOT_SET'
export type ColorTheme = 'LIGHT' | 'DARK'
export type Language = 'en-CA' | 'fr-CA' | 'ja-JP' | 'zh-CN' | 'zh-TW'
export type secondVerificationValume = '1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'
export type SeguroNetworkStatus = WorkerCallStatus | 
'TIMEOUT_EMAIL_SERVER' | 'TIMEOUT_SEGURO_NETWORK' |
'NO_INTERNET' | 'CONNECTING_ACCESS_POINT' |
'CONNECTING_SEGURO_NETWORK'

export interface profile {
    nicknameMark: string
    nickname: string
    keyID?: string
    tags: string[]
    alias: string
}

interface PreferencesObj {
    preferences: any
    /*eslint-disable */
    storePreferences?: (preferences: any) => Promise <[WorkerCallStatus, ContainerData?]>
    /*eslint-enable */
}
/*eslint-disable */
interface profileObj {
    profiles: profile[]
    newProfile?: (profile: profile) => Promise<StartWorkerResolve>
    storeProfile?: () => Promise<StartWorkerResolve>
}
/*eslint-enable */
export interface ContainerData {
    preferences: PreferencesObj
    /*eslint-disable */
    passcode: Passcode
    /*eslint-enable */
    profile: profileObj
    //seguroNetwork: (SeguroNetworkStatus: SeguroNetworkStatus) => void,
}

export type passcodeUnlockStatus = 
    [status: 'FAILURE' | 'COUNTDOWN' | WorkerCallStatus, payload?: ContainerData]

interface Passcode {
    status: PasscodeStatus
    testPasscode?: (
        passcode: string,
        progressCallback: ( progressInteger: string, progressFractional: string ) => void
    ) => Promise <passcodeUnlockStatus>
    createPasscode?: (
        passcode: string,
        progressCallback: ( progressInteger: string, progressFractional: string ) => void
    ) => Promise <[WorkerCallStatus, ContainerData?]>
    lock?: () => Promise <[WorkerCallStatus, ContainerData?]>
    deletePasscode?: () => Promise <[WorkerCallStatus, ContainerData?]>
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
