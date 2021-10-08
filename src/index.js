import Router from './router'
import img from './handlers/img'
import video, { videoInfo } from './handlers/video'

export default async (req, res) => {
    try {
        const r = new Router()
        r.get(/^\/video\/([\w\-]{6,12})\.(jpg|webp)$/, img)
        r.get(/^\/video\/([\w\-]{6,12})\.json$/, videoInfo)
        r.get(/^\/video\/([\w\-]{6,12})\/(\d{1,3})\/(\d+-\d+)\.ts$/, video)
        const { statusCode, headers, body } = await r.route(req)
        res.status(statusCode);
        for (const [k, v] of Object.entries(headers)) {
            res.setHeader(k, v);
        }
        res.send(body);
    } catch (e) {
        console.error(e)
    }
}