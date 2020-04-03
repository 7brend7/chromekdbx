import { Request, Response, Router } from 'express'

import cklog from '../cklog'

import databaseManager from '../db/DatabaseManager'
import routers from '.'
import PopupItem from '../../Interfaces/PopupItem'

export default (router: Router) => {

    router.get(`/${routers.items}`, async (req: Request, res: Response) => {
        try {
            if (!req.token) {
                throw new Error('No token provided')
            }

            const items: PopupItem[] = await databaseManager.getAll(req.token)
            res.json(items)
        } catch (e) {
            cklog.error(e.message)
            res.json({ error: "Can't connect to db" })
        }
    })
}
