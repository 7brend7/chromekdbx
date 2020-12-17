import { Request, Response, Router } from 'express'

import cklog from '../cklog'

import databaseManager from '../db/DatabaseManager'
import routers from '.'

export default (router: Router) => {
    router.get(`/${routers.db}`, async (req: Request, res: Response) => {
        try {
            if (!req.token) {
                throw new Error('No token provided')
            }

            const data = await databaseManager.getBinary(req.token)

            res.set('Content-Type', 'application/octet-stream')
            res.send(Buffer.from(data))
        } catch (e) {
            cklog.error(e.message)
            // eslint-disable-next-line prettier/prettier
            res.json({ error: 'Can\'t connect to db' })
        }
    })

    router.put(`/${routers.db}`, async (req: Request, res: Response) => {
        try {
            if (!req.token) {
                throw new Error('No token provided')
            }

            const db: ArrayBuffer = req.body

            await databaseManager.setDb(db, req.token)

            res.json('OK')
        } catch (e) {
            cklog.error(e.message)
            // eslint-disable-next-line prettier/prettier
            res.json({ error: 'Can\'t connect to db' })
        }
    })
}
