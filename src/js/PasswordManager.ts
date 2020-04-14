/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 11/27/18
 * Time: 10:46
 */

import kdbxweb, { ProtectedValue } from 'kdbxweb'
import storageManager from './StorageManager'

class PasswordManager {
    static async set(passwd: string | ProtectedValue): Promise<ProtectedValue> {
        const passwdValue = passwd instanceof ProtectedValue ? passwd : kdbxweb.ProtectedValue.fromString(passwd)
        await storageManager.setItem('password', passwdValue.getBinary())
        return this.get()
    }

    static async get(): Promise<ProtectedValue> {
        const passwdBinary = await storageManager.getItem('password')
        return kdbxweb.ProtectedValue.fromBinary(passwdBinary)
    }

    static async clear(): Promise<void> {
        await storageManager.deleteItem('password')
    }
}

export default PasswordManager
