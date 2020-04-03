import { Request, Response, Router } from 'express'
import Connection, { IConnectionDocument } from '../models/Connection'
import databaseManager from '../db/DatabaseManager'

import kdbxweb from 'kdbxweb'
import cklog from '../cklog'
import routers from '.'
import auth from '../auth'
import { connection } from 'mongoose'

export default (router: Router) => {

    /**
     * @swagger
     * /api/v1/connect:
     *     get:
     *         summary: connection test, creates connection instance
     *         security:
     *             - ApiKeyAuth: []
     */
    router.post(`/${routers.connect}`, async (req: Request, res: Response) => {

        let connection: IConnectionDocument | null = null

        try {

            const { name, password } = req.body

            const data = <IConnectionDocument>{
                name,
                password: new Buffer(kdbxweb.ProtectedValue.fromString(password).getBinary().buffer),
                token: auth.getToken(),
                extensionId: req.headers['id'],
            }

            connection = await Connection.create(data)

            databaseManager.setConnection(connection)

            await databaseManager.initDb(connection.token)

            res.json(connection.token)
        } catch (e) {
            connection && (connection.remove())
            cklog.error(e.message)
            res.json({ error: 'Connection error' })
        }
    })
}
