import { Credentials } from 'kdbxweb'

/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2019-08-21
 * Time: 16:55
 */

export default interface IDbConnector {
    getDb(): Promise<ArrayBuffer>
    getCredentials(): Promise<Credentials>
    saveDb(dataAsArrayBuffer: ArrayBuffer): Promise<void>
    clear(): Promise<void>
}
