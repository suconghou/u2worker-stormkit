import { fetch, filterHeaders } from '../utils/fetch'
import { get, set } from '../utils/util'
import videoParser from '../libs/videoparser'

export default async req => {
    const start = Date.now()
    const matches = req.path.match(/\/video\/([\w\-]{6,12})\/(\d{1,3})\/(\d+-\d+)\.ts/)
    const vid = matches[1]
    const itag = matches[2]
    const cacheKey = `${vid}/${itag}`
    let cacheItem = get(cacheKey)
    if (cacheItem) {
        const target = `${cacheItem.url}&range=${matches[3]}`
        const { data, headers } = await fetch(target)
        return {
            statusCode: 200,
            headers: filterHeaders(headers, `888${Date.now() - start}`),
            body: data,
        }
    }
    try {
        cacheItem = await videoURLParse(vid, itag)
    } catch (e) {
        return {
            statusCode: 500,
            headers: filterHeaders({}, 3600),
            body: JSON.stringify({ code: -1, msg: e.message || e.stack || e })
        }
    }
    if (!cacheItem.url) {
        return {
            statusCode: 500,
            headers: filterHeaders({}, 1),
            body: 'invalid url'
        }
    }
    set(cacheKey, cacheItem)
    const target = `${cacheItem.url}&range=${matches[3]}`
    const parsetime = Date.now() - start
    const { data, headers } = await fetch(target)
    return {
        statusCode: 200,
        headers: filterHeaders(headers, `${parsetime}99${Date.now() - start}`),
        body: data,
    }
}


export const videoInfo = async req => {
    const matches = req.path.match(/\/video\/([\w\-]{6,12})\.json/)
    const vid = matches[1]
    try {
        return await videoInfoParse(vid)
    } catch (e) {
        return {
            statusCode: 200,
            headers: filterHeaders({}, 3600),
            body: JSON.stringify({ code: -1, msg: e.message || e.stack || e })
        }
    }
}

const videoURLParse = async (vid, itag) => {
    const parser = new videoParser(vid)
    const info = await parser.infoPart(itag)
    return info
}

const videoInfoParse = async (vid) => {
    const start = +new Date()
    let info = get(vid)
    if (!info) {
        const parser = new videoParser(vid)
        info = await parser.info()
        set(vid, info)
    }
    for (let item of Object.values(info.streams || {})) {
        delete item.url
    }
    return {
        statusCode: 200,
        body: JSON.stringify(info),
        headers: filterHeaders({ 'content-type': 'application/json' }, `9999${(+new Date() - start)}`)
    }
}
