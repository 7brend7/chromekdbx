/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2019-04-29
 * Time: 14:51
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import express, { Application, Request, Response } from 'express'
import bodyParser from 'body-parser'
import morgan, { Options } from 'morgan'
import publicIp from 'public-ip'

import dotenv from 'dotenv'

import routersInit from './routers/init'
import auth from './auth'
import cklog from './cklog'
import dbInit from './db/init'

const processCwd = process.cwd()

dotenv.config({
    path: path.resolve(processCwd, 'src/js/sync_server/.env')
})

console.log(process.env)

class Server {
    private app: Application = express()

    private port: number = parseInt(process.env.PORT as string, 10) || 443

    private initOk = false

    async configure(): Promise<boolean> {
        // use body parser so we can get info from POST and/or URL parameters
        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.raw())
        this.app.use(
            morgan('tiny', {
                skip: (req: Request, res: Response) => req.is('html')
            } as Options<Request, Response>)
        )

        try {
            await dbInit()
            return true
        } catch (e) {
            cklog.error(e.message)
        }

        return false
    }

    async run(): Promise<void> {
        this.initOk = await this.configure()

        this.initOk && this.initRoutes()

        // TODO: move keys out!;
        const privateKey = fs.readFileSync(path.resolve(processCwd, 'src/js/sync_server/keys/server.key'), 'utf8')
        const certificate = fs.readFileSync(path.resolve(processCwd, 'src/js/sync_server/keys/server.crt'), 'utf8')

        const credentials = { key: privateKey, cert: certificate }
        const httpsServer = https.createServer(credentials, this.app)

        httpsServer.listen(this.port, () => cklog.success(`Server is running on port ${this.port}\n`))
    }

    private initRoutes(): void {
        auth.init(routersInit.getRouter())

        routersInit.init(this.app)

        publicIp.v4().then((ip: string) => {
            cklog.notice(`Your api url is: https://${ip}${this.port !== 443 ? `:${this.port}` : ''}${routersInit.getApiPath()}`)
        })
    }
}

const server = new Server()
server.run()
