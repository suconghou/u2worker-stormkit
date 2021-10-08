// Conditions
const Method = method => req => req.method.toLowerCase() === method.toLowerCase()

// Helper functions that when passed a request
// will return a boolean for if that request uses that method, header, etc..
const Get = Method('get')
const Post = Method('post')
const Put = Method('put')
const Patch = Method('patch')
const Delete = Method('delete')
const Head = Method('head')
const Options = Method('options')

const Header = (header, val) => req => req.getHeader(header) === val
const Host = host => Header('host', host.toLowerCase())
const Referrer = host => Header('referrer', host.toLowerCase())

const Path = regExp => req => {
    const url = req.path
    const path = url
    return path.match(regExp)
}

// Router
class Router {
    constructor() {
        this.routes = []
    }

    handle(conditions, handler) {
        this.routes.push({
            conditions,
            handler,
        })
        return this
    }

    get(url, handler) {
        return this.handle([Get, Path(url)], handler)
    }

    post(url, handler) {
        return this.handle([Post, Path(url)], handler)
    }

    patch(url, handler) {
        return this.handle([Patch, Path(url)], handler)
    }

    delete(url, handler) {
        return this.handle([Delete, Path(url)], handler)
    }

    all(handler) {
        return this.handle([], handler)
    }

    route(req) {
        const route = this.resolve(req)

        if (route) {
            return route.handler(req)
        }
        return {
            statusCode: 404,
            body: 'not found',
            headers: {
                'content-type': 'text/plain',
            },
        }
    }

    // resolve returns the matching route, if any
    resolve(req) {
        return this.routes.find(r => {
            if (!r.conditions || (Array.isArray(r) && !r.conditions.length)) {
                return true
            }

            if (typeof r.conditions === 'function') {
                return r.conditions(req)
            }

            return r.conditions.every(c => c(req))
        })
    }
}

export default Router