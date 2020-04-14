/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 06/18/19
 * Time: 17:01
 */
import { ByteUtils, KdbxUuid, ProtectedValue } from 'kdbxweb'
import routers from './sync_server/routers'
import PopupItem from './Interfaces/PopupItem'
import PageItem from './PageItem'
import ErrorResponse from './Interfaces/ErrorResponse'
import ApiEntry from './Interfaces/ApiEntry'

const { bytesToString } = ByteUtils

class ApiManager {
    private baseUrl: string | null = null

    private token: string | null = null

    private name: string | null = null

    private id: string = chrome.runtime.id

    private apiDataKey = 'apiData'

    /**
     *
     */
    constructor() {
        this.loadCredentials()
    }

    /**
     * @param uri
     * @param method
     * @param modifyRequest
     * @param rawResponse
     */
    private async process(uri: string | URL, method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE', modifyRequest?: (data: RequestInit) => void, rawResponse: boolean = false): Promise<any> {
        if (this.baseUrl === null || this.token === null || this.name === null) {
            throw new Error('Empty url or token')
        }

        const headers = new Headers()
        headers.append('x-access-token', this.token)
        headers.append('Content-Type', 'application/json')
        headers.append('id', this.id)
        headers.append('name', this.name)

        const options = {
            method,
            headers,
        }

        modifyRequest && (modifyRequest(options))

        let res: unknown = null

        try {
            let genUri = uri
            if (typeof uri === 'string') {
                genUri = (new URL(uri, this.baseUrl))
            }
            console.log(`querying: ${genUri}`)

            const resp: Response = await fetch(genUri.toString(), options)
            console.log(`result code: ${resp.status}`)
            if (rawResponse) {
                return resp
            }
            if (resp.status !== 200) {
                throw new Error('Connection error')
            }
            res = await resp.json()
            if (res && typeof (res as ErrorResponse).error !== 'undefined') {
                throw new Error((res as ErrorResponse).error)
            }
        } catch (e) {
            console.error(e.message)
        }

        return res
    }

    /**
     *
     */
    loadCredentials(): void {
        const apiData = localStorage.getItem(this.getDataKey())

        if (apiData) {
            const { baseUrl, token, name } = JSON.parse(apiData)
            this.baseUrl = baseUrl
            this.token = token
            this.name = name
        }
    }

    async clear(): Promise<void> {
        this.baseUrl = null
        this.token = null
        this.name = null

        localStorage.removeItem(this.getDataKey())
    }

    /**
     * @param name
     * @param baseUrl
     */
    saveCredentials(name: string, baseUrl: string): void {
        this.baseUrl = baseUrl.replace(/\/?$/, '/')
        this.name = name

        this.saveData()
    }

    saveToken(token: string): void {
        this.token = token

        this.saveData()
    }

    saveData(): void {
        localStorage.setItem(this.getDataKey(), JSON.stringify({
            baseUrl: this.baseUrl,
            name: this.name,
            token: this.token,
        }))
    }

    async connect(name: string, password: string): Promise<void> {
        this.token = 'empty'
        const result: string | ErrorResponse = await this.process(routers.connect, 'POST', (data: RequestInit) => {
            data.body = JSON.stringify({
                name,
                password,
            })
        })
        if (!result || (result as ErrorResponse).error) {
            throw new Error('Can\'t connect to current server with such credentials')
        }

        this.saveToken(result as string)
    }

    getDataKey() {
        return this.apiDataKey
    }

    /* initDb(name: string, password: string): Promise<ApiResponse> {
        return this.process(routers.db, 'POST', (data: RequestInit) => {
            data.body = JSON.stringify({
                name,
                password
            });
        });
    } */

    async getBinary(): Promise<ArrayBuffer> {
        const resp: Response = await this.process(routers.db, 'GET', () => {}, true)
        return await resp.arrayBuffer()
    }

    getAll(): Promise<PopupItem[]> {
        return this.process(routers.items, 'GET')
    }

    async findItemByHost(host: string): Promise<ApiEntry[]> {
        const data = await this.process(routers.search, 'POST', (data: RequestInit) => {
            data.body = JSON.stringify({
                entity: 'entry',
                type: 'host',
                value: host,
            })
        })

        return data.map((item: ApiEntry): ApiEntry => ({
            fields: {
                ...item.fields,
                Password: ProtectedValue.fromString(item.fields.Password as string),
                chrome_kdbx: ProtectedValue.fromString(item.fields.chrome_kdbx as string),
            },

        }))
    }

    async synchronize(db: ArrayBuffer, time: number): Promise<{db: {[key: number]: number}, time: number}> {
        const resp: {db: {[key: number]: number}, time: number} = await this.process(`${routers.db}/sync`, 'PUT', (data: RequestInit) => {
            data.body = JSON.stringify({
                time,
                db: new Int8Array(db),
            })
        })
        return resp
    }

    async saveDb(db: ArrayBuffer): Promise<void> {
        await this.process(`${routers.db}`, 'PUT', (data: RequestInit) => {
            (data.headers as Headers).set('Content-Type', 'application/octet-stream')
            data.body = db
        })
    }
}

export default ApiManager
0
