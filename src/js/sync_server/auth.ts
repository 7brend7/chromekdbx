import {
    Router, Request, Response, NextFunction,
} from 'express'
import jwt, { VerifyErrors } from 'jsonwebtoken'
import { IConnectionDocument } from './models/Connection'
import databaseManager from './db/DatabaseManager'
import routers from './routers'
import cklog from './cklog'

class Auth {
    private secretKey: string = <string>process.env.SECRET_KEY

    init(route: Router) {
        route.use((req: Request, res: Response, next: NextFunction) => {
            if (req.url === `/${routers.connect}`) {
                return next()
            }

            const { id: extensionId, 'x-access-token': token } = req.headers

            if (token) {
                jwt.verify(token as string, this.secretKey, async (err: VerifyErrors, decoded: object | string) => {
                    try {
                        if (err) {
                            throw new Error(err.message)
                        }

                        const connection: IConnectionDocument | null = await databaseManager.initConnection(token as string)
                        if (!connection) {
                            throw new Error('Connection not found')
                        }

                        // if everything is good, save to request for use in other routes
                        (<any>req).decoded = decoded;
                        (<any>req).token = token
                        next()
                    } catch (e) {
                        cklog.error(e.message)
                        return res.json({ error: 'Failed to authenticate token.' })
                    }
                })
            } else {
                // if there is no token
                // return an error
                return res.status(403).send({ error: 'No token provided.' })
            }
        })
    }

    getToken(): string {
        return jwt.sign({
            randStr: Math.random().toString(36).substring(2, 15),
        }, this.secretKey)
    }
}

export default new Auth()
