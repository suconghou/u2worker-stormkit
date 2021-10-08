
const exposeHeaders = ['Content-Type', 'Content-Length', 'Content-Encoding', 'Date', 'Last-Modified', 'Etag'];

const cache = new Map()

export const get = (key) => {
    const item = cache.get(key)
    if (item) {
        if (item.expire > +new Date()) {
            return item.value
        } else {
            expire()
        }
    }
}

export const set = (key, value, ttl = 3600e3) => {
    cache.set(key, { value, expire: +new Date() + ttl })
}

export const expire = () => {
    const t = +new Date()
    for (let [k, v] of cache) {
        if (v.expire < t) {
            cache.delete(k)
        }
    }
}

export const copyHeader = (status, headers = {}, head) => {
    const ok = status == 200 || status == 206;
    const age = ok ? 864000 : 60;
    const header = { 'cache-control': `public, max-age=${age}` }
    for (let item of exposeHeaders) {
        if (head.has(item)) {
            const v = head.get(item)
            if (v) {
                header[item] = v
            }
        }
    }
    if (!ok) {
        return Object.assign(headers, header);
    }
    return Object.assign(header, headers)
}
