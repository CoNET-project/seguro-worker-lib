export type WorkerCommandErrorType = 'NOT_READY'|'INVALID_DATA'|'NO_UUID'|'INVALID_COMMAND'

export type WorkerCommandType = 'helloWorld'|
'READY'|'encrypt_TestPasscord'|'encrypt_createPasscode'|'encrypt_lock'

export type WorkerCallStatus = 'SUCCESS' | 'NOT_READY' | 'UNKNOWN_COMMAND' | 'TIME_OUT'
export type PasscodeStatus = 'LOCKED' | 'UNLOCKED' | 'UNDEFINED'
export type ColorTheme = 'LIGHT' | 'DARK'
export type Language = 'en-CA ' | 'fr-CA' | 'ja-JP' | 'zh-CN' | 'zh-TW'
export type secondVerificationValume = '1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'
export type SeguroNetworkStatus = WorkerCallStatus | 
'TIMEOUT_EMAIL_SERVER' | 'TIMEOUT_SEGURO_NETWORK' |
'NO_INTERNET' | 'CONNECTING_ACCESS_POINT' |
'CONNECTING_SEGURO_NETWORK'

export interface profile {
    nicknameMark: string
    nickname: string
    keyID: string
    tags: string[]
}
interface Preferences {
    colorTheme: ColorTheme
    language: Language
}

export interface ContainerData {
    preferences: Preferences
    /*eslint-disable */
    passcord: Passcord
    /*eslint-enable */
    profiles: profile []
    //seguroNetwork: (SeguroNetworkStatus: SeguroNetworkStatus) => void,
}

export type passcodeUnlockStatus = 
    [status: 'FAILURE' | 'COUNTDOWN' | WorkerCallStatus, payload?: ContainerData]

interface Passcord {
    status: PasscodeStatus
    testPasscord: (
        passcode: string,
        progressCallback: ( progress: number ) => void
    ) => Promise <passcodeUnlockStatus>
    createPasscode: (
        passcode: string,
        progressCallback: ( progress: number ) => void
    ) => Promise <[WorkerCallStatus, ContainerData?]>
    lock: () => Promise <[WorkerCallStatus, ContainerData?]>
}

export interface WorkerCommand {
    cmd: WorkerCommandType
    data?: any
    uuid?: string
    err?: WorkerCommandErrorType
}

export type CreatePasscodeResolve = 
[status: WorkerCallStatus, updateProgress?: ( percentage: number ) => void ]

export type HelloWorldResolve = [WorkerCallStatus, string?]

export type StartWorkerResolve = [WorkerCallStatus, ContainerData?]
