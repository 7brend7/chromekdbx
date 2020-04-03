import { Router, Application, Request, Response } from 'express'

// Routers
import connectRouter from './connect'
import dbRouter from './db'
import itemsRouter from './items'
import searchRouter from './search'

class Init {
    private router: Router = Router()
    private apiPath = '/api/v1'

    init(app: Application): void {

        connectRouter(this.router)
        dbRouter(this.router)
        itemsRouter(this.router)
        searchRouter(this.router)

        app.use(this.apiPath, this.router)
    }

    getRouter(): Router {
        return this.router
    }

    getApiPath(): string {
        return this.apiPath
    }
}

export default new Init()
