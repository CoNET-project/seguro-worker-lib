export type WorkerCommandErrorType = 'NOT_READY'|'INVALID_DATA'|'NO_UUID'|'INVALID_COMMAND'

export type WorkerCommandType = 'helloWorld'|
'READY'|'storage_StoreContainerData'|'encrypt_InitSeguroData'

export interface WorkerCommand {
    cmd: WorkerCommandType
    data?: any
    uuid?: string
    err?: WorkerCommandErrorType
}

export type WorkerCallStatus = 'SUCCESS' | 'NOT_READY' | 'UNKNOWN_COMMAND' | 'TIME_OUT'

export type Passcode = 'LOCKED' | 'UNLOCKED' | 'UNDEFINED'

export type ColorTheme = 'LIGHT' | 'DARK'

export type Language = 'en' | 'fr' | 'jp'

interface preferences {
    colorTheme: ColorTheme,
    language: Language
}

export type SeguroNetworkStatus = WorkerCallStatus | 
'TIMEOUT_EMAIL_SERVER' | 'TIMEOUT_SEGURO_NETWORK' |
'NO_INTERNET' | 'CONNECTING_ACCESS_POINT' |
'CONNECTING_SEGURO_NETWORK'

export type secondVerificationValume = '1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'

export type CreatePasscodeResolve = 
[status: WorkerCallStatus, updateProgress?: ( percentage: number ) => void ]

export type HelloWorldResolve = [status: WorkerCallStatus, payload?: string]

export type passcodeUnlockStatus = 'FAILURE' | 'COUNTDOWN' | WorkerCallStatus

export type passcodeUnlockResolve = [status: passcodeUnlockStatus]

export interface ContainerMethod {
    createPasscode: ( 
        password: string,
        secondVerification: secondVerificationValume
    ) => Promise <CreatePasscodeResolve>
    helloWorld: Promise<HelloWorldResolve>
    passcodeUnlock?: Promise<passcodeUnlockResolve>
    eraseAll: Promise<HelloWorldResolve>
}

export interface ContainerData {
    passcord: Passcode,
    preferences: preferences,
    seguroNetwork: (SeguroNetworkStatus: SeguroNetworkStatus) => void,
    method: ContainerMethod
}

export type StartWorkerResolve = [status: WorkerCallStatus, payload?: ContainerData]
