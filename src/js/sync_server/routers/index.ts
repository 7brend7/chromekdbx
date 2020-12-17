const routers: string[] = ['connect', 'db', 'items']

export default routers.reduce(
    (prev: { [key: string]: string }, current: string) => ({
        ...prev,
        [current]: current
    }),
    {}
)
