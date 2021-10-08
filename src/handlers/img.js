import { fetch, filterHeaders } from '../utils/fetch'

const imageMap = {
    "jpg": "https://i.ytimg.com/vi/",
    "webp": "https://i.ytimg.com/vi_webp/"
}

export default async (req) => {
    const matches = req.path.match(/\/video\/([\w\-]{6,12})\.(jpg|webp)/)
    const vid = matches[1]
    const ext = matches[2]
    const target = imageMap[ext] + vid + "/mqdefault." + ext
    const head = {
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
    };
    const { headers, data } = await fetch(target, head)
    return {
        statusCode: 200,
        headers: filterHeaders(headers, 604800),
        body: data.toString()
    }
}