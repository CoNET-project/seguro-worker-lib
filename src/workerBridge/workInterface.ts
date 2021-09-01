export interface KeyPair {
    publicKeyArmor: string
    privateKeyArmor: string
}

export interface encryptedInit {
    containerKeyPair: KeyPair
    data: {
        deviceKeyPair: KeyPair
        seguroAccountKeyPair: KeyPair
    }
    password: string
}

export interface encryptKeys {
    containerKeyPair: {
        publicKeyArmor: string
        privateKeyArmor: string
        
    }
    keyChain: {
        deviceKeyPair: {
            publicKeyArmor: string
            privateKeyArmor: string
        }
        seguroAccountKeyPair: {
            publicKeyArmor: string
            privateKeyArmor: string
        }
    }
    password: string
}
