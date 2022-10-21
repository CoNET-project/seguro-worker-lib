export type WorkerCommandErrorType = 'NOT_READY'|'INVALID_DATA'|
'NO_UUID'|'INVALID_COMMAND'|'OPENPGP_RUNNING_ERROR'|
'PouchDB_ERROR'|'GENERATE_PASSCODE_ERROR'|'FAILURE'|'COUNTDOWN'

export type WorkerCommandType = 'READY'|'encrypt_TestPasscode'|
'encrypt_createPasscode'|'encrypt_lock'|'encrypt_deletePasscode'|'storePreferences'|
'newProfile'|'storeProfile'|'invitation'|'WORKER_MESSAGE'

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

export interface profile {
    bio: string
    nickname: string
    keyID?: string
    tags: string[]
    alias: string
    isPrimary: boolean
    profileImg: string
}

interface PreferencesObj {
    preferences: any
    /*eslint-disable */
    storePreferences?: () => Promise <[WorkerCallStatus, ContainerData?]>
    /*eslint-enable */
}
/*eslint-disable */
interface profileObj {
    profile: profile
    newProfile?: (profile: profile) => Promise<StartWorkerResolve>
    storeProfile?: () => Promise<StartWorkerResolve>
}
interface seguroNetwork {
    SeguroStatus: SeguroNetworkStatus
    invitation?: (code: string) => Promise <SeguroNetworkStatus>
    sharedDeviceInvitation: string[]
    SeguroStatusListening?: (status: SeguroNetworkStatus) => void
    SeguroObject?: {
        sharedDeviceInvitation: string[]
        server_listening_folder: string
        
    }
}
type CryptoAssetHistory = {
	status: 'Pending'|'Confirmed'
	amount: number
	Nonce: number
	to: string
	transactionFee: number
	gasLimit: number
	gasUsed: number
	baseFee: number
	priorityFee: number
	totalGasFee: number
	maxFeePerGas: number
	total: number
}

interface TokenPreferences {
	networkName: string						//
	RpcURL: string							//		Token Contract Address
	chainID: number							//		Token Decimal
	currencySymbol: string					//		Token Symbol
	blockExplorerURL: string
}


/*eslint-enable */
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
	}
	status: PasscodeStatus
	data: any
	preferences: any
}

export type passcodeUnlockStatus = 
    [status: 'FAILURE' | 'COUNTDOWN' | WorkerCallStatus, payload?: ContainerData]


export interface WorkerCommand {
    cmd: WorkerCommandType
    data?: any
    uuid?: string
    err?: WorkerCommandErrorType
}

export type CreatePasscodeResolve = 
    [status: WorkerCallStatus, updateProgress?: ( percentage: number ) => void ]

export type StartWorkerResolve = [WorkerCallStatus, ContainerData?]
