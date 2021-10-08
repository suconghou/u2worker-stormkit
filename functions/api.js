// Conditions
const Method = method => req => req.method.toLowerCase() === method.toLowerCase();

// Helper functions that when passed a request
// will return a boolean for if that request uses that method, header, etc..
const Get = Method('get');
const Post = Method('post');
const Patch = Method('patch');
const Delete = Method('delete');

const Path = regExp => req => {
    const url = req.path;
    const path = url;
    return path.match(regExp)
};

// Router
class Router {
    constructor() {
        this.routes = [];
    }

    handle(conditions, handler) {
        this.routes.push({
            conditions,
            handler,
        });
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
        const route = this.resolve(req);

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

const cache = new Map();

const get = (key) => {
    const item = cache.get(key);
    if (item) {
        if (item.expire > +new Date()) {
            return item.value
        } else {
            expire();
        }
    }
};

const set = (key, value, ttl = 3600e3) => {
    cache.set(key, { value, expire: +new Date() + ttl });
};

const expire = () => {
    const t = +new Date();
    for (let [k, v] of cache) {
        if (v.expire < t) {
            cache.delete(k);
        }
    }
};

const https = require('https');

const agent = new https.Agent({ keepAlive: true });
const reqHeaders = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:74.0) Gecko/20100101 Firefox/74.0' };
const timeout = 10e3;

const exposeHeaders = ['content-type', 'content-length', 'content-encoding'];

const fetch = async (url, header = {}) => {
    let text = get(url);
    if (text) {
        return text
    }
    text = await httpGet(url, header);
    set(url, text);
    return text
};

async function httpGet(url, header = {}) {
    return new Promise((resolve, reject) => {
        let times = 0;
        const fn = (target) => {
            https.get(target, { timeout, headers: { ...reqHeaders, ...header }, agent, }, (res) => {
                times++;
                const { statusCode, headers } = res;
                let error;
                if (statusCode !== 200) {
                    if (times <= 3 && [301, 302, 303].includes(statusCode)) {
                        if (headers.location.substr(0, 4).toLowerCase() == "http") {
                            target = headers.location;
                        } else {
                            const u = new URL(target);
                            if (headers.location.charAt(0) == "/") {
                                target = u.origin + headers.location;
                            } else {
                                const arr = u.pathname.split('/');
                                arr[arr.length - 1] = headers.location;
                                target = u.origin + arr.join('/');
                            }
                        }
                        return fn(target)
                    }
                    error = new Error(`${url} Status Code: ${statusCode}`);
                }
                if (error) {
                    res.resume();
                    return reject(error)
                }
                const buf = [];
                res.on('error', reject).on('data', (chunk) => { buf.push(chunk); }).on('end', () => resolve({ headers, data: Buffer.concat(buf) }));
            }).on('error', reject);
        };
        fn(url);
    })
}

const filterHeaders = (head, age = 3600) => {
    const headers = { 'Access-Control-Allow-Origin': '*', 'cache-control': `public, max-age=${age}` };
    for (let item of exposeHeaders) {
        if (head[item]) {
            headers[item] = head[item];
        }
    }
    return headers
};

const imageMap = {
    "jpg": "https://i.ytimg.com/vi/",
    "webp": "https://i.ytimg.com/vi_webp/"
};

var img = async (req) => {
    const matches = req.path.match(/\/video\/([\w\-]{6,12})\.(jpg|webp)/);
    const vid = matches[1];
    const ext = matches[2];
    const target = imageMap[ext] + vid + "/mqdefault." + ext;
    const head = {
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
    };
    const { headers, data } = await fetch(target, head);
    return {
        statusCode: 200,
        headers: filterHeaders(headers, 604800),
        body: data
    }
};

const https$1 = require('https');
const agent$1 = new https$1.Agent({ keepAlive: true });
const headers = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:74.0) Gecko/20100101 Firefox/74.0' };
const timeout$1 = 5e3;
const cache$1 = new Map();
const get$1 = (key) => {
    const item = cache$1.get(key);
    if (item) {
        if (item.expire > +new Date()) {
            return item.value;
        }
        else {
            expire$1();
        }
    }
};
const set$1 = (key, value, ttl = 3600e3) => {
    cache$1.set(key, { value, expire: +new Date() + ttl });
};
const expire$1 = () => {
    const t = +new Date();
    for (let [k, v] of cache$1) {
        if (v.expire < t) {
            cache$1.delete(k);
        }
    }
};
const ajax = async (url) => {
    let text = get$1(url);
    if (text) {
        return text.toString();
    }
    text = await httpGet$1(url);
    set$1(url, text);
    return text.toString();
};
async function httpGet$1(url) {
    return new Promise((resolve, reject) => {
        let times = 0;
        const fn = (target) => {
            https$1.get(target, { timeout: timeout$1, headers, agent: agent$1, }, (res) => {
                times++;
                const { statusCode, headers } = res;
                let error;
                if (statusCode !== 200) {
                    if (times <= 3 && [301, 302, 303].includes(statusCode)) {
                        if (headers.location.substr(0, 4).toLowerCase() == "http") {
                            target = headers.location;
                        }
                        else {
                            const u = new URL(target);
                            if (headers.location.charAt(0) == "/") {
                                target = u.origin + headers.location;
                            }
                            else {
                                const arr = u.pathname.split('/');
                                arr[arr.length - 1] = headers.location;
                                target = u.origin + arr.join('/');
                            }
                        }
                        return fn(target);
                    }
                    error = new Error(`${url} Status Code: ${statusCode}`);
                }
                if (error) {
                    res.resume();
                    return reject(error);
                }
                const buf = [];
                res.on('error', reject).on('data', (chunk) => { buf.push(chunk); }).on('end', () => resolve(Buffer.concat(buf)));
            }).on('error', reject);
        };
        fn(url);
    });
}

const parseQuery = (str) => {
    if (!str) {
        return {};
    }
    const pairs = (str[0] === '?' ? str.substr(1) : str).split('&');
    const params = {};
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return params;
};

class decipher {
    constructor(jsPath, fetch) {
        this.jsPath = jsPath;
        this.fetch = fetch;
    }
    async init() {
        const bodystr = await this.fetch(this.jsPath);
        const objResult = bodystr.match(/var ([a-zA-Z_\$][a-zA-Z_0-9]*)=\{((?:(?:[a-zA-Z_\$][a-zA-Z_0-9]*:function\(a\)\{(?:return )?a\.reverse\(\)\}|[a-zA-Z_\$][a-zA-Z_0-9]*:function\(a,b\)\{return a\.slice\(b\)\}|[a-zA-Z_\$][a-zA-Z_0-9]*:function\(a,b\)\{a\.splice\(0,b\)\}|[a-zA-Z_\$][a-zA-Z_0-9]*:function\(a,b\)\{var c=a\[0\];a\[0\]=a\[b(?:%a\.length)?\];a\[b(?:%a\.length)?\]=c(?:;return a)?\}),?\n?)+)\};/);
        if (!objResult) {
            throw new Error("objResult not match");
        }
        const funcResult = bodystr.match(/function(?: [a-zA-Z_\$][a-zA-Z_0-9]*)?\(a\)\{a=a\.split\(""\);\s*((?:(?:a=)?[a-zA-Z_\$][a-zA-Z_0-9]*\.[a-zA-Z_\$][a-zA-Z_0-9]*\(a,\d+\);)+)return a\.join\(""\)\}/);
        if (!funcResult) {
            throw new Error("funcResult not match");
        }
        const obj = objResult[1].replace(/\$/g, '\\$');
        const objBody = objResult[2].replace(/\$/g, '\\$');
        const funcBody = funcResult[1].replace(/\$/g, '\\$');
        let result = objBody.match(/(?:^|,)([a-zA-Z_\$][a-zA-Z_0-9]*):function\(a\)\{(?:return )?a\.reverse\(\)\}/m);
        const reverseKey = result ? result[1].replace(/\$/g, '\\$') : '';
        result = objBody.match(/(?:^|,)([a-zA-Z_\$][a-zA-Z_0-9]*):function\(a,b\)\{return a\.slice\(b\)\}/m);
        const sliceKey = result ? result[1].replace(/\$/g, '\\$') : '';
        result = objBody.match(/(?:^|,)([a-zA-Z_\$][a-zA-Z_0-9]*):function\(a,b\)\{a\.splice\(0,b\)\}/m);
        const spliceKey = result ? result[1].replace(/\$/g, '\\$') : '';
        result = objBody.match(/(?:^|,)([a-zA-Z_\$][a-zA-Z_0-9]*):function\(a,b\)\{var c=a\[0\];a\[0\]=a\[b(?:%a\.length)?\];a\[b(?:%a\.length)?\]=c(?:;return a)?\}/m);
        const swapKey = result ? result[1].replace(/\$/g, '\\$') : '';
        const regex = new RegExp(`(?:a=)?${obj}\\.(${[reverseKey, sliceKey, spliceKey, swapKey].filter(v => v).join('|')})\\(a,(\\d+)\\)`, 'g');
        const tokens = [];
        while ((result = regex.exec(funcBody)) !== null) {
            switch (result[1]) {
                case swapKey:
                    tokens.push(`w${result[2]}`);
                    break;
                case reverseKey:
                    tokens.push("r");
                    break;
                case sliceKey:
                    tokens.push(`s${result[2]}`);
                    break;
                case spliceKey:
                    tokens.push(`p${result[2]}`);
                    break;
            }
        }
        if (tokens.length < 1) {
            throw new Error("error parsing signature tokens");
        }
        this.tokens = tokens;
    }
    async decode(s) {
        if (!this.tokens) {
            await this.init();
        }
        let sig = s.split('');
        let pos = 0;
        for (let tok of this.tokens) {
            if (tok.length > 1) {
                pos = ~~tok.slice(1);
            }
            switch (tok[0]) {
                case 'r':
                    sig = sig.reverse();
                    break;
                case 'w':
                    const tmp = sig[0];
                    sig[0] = sig[pos];
                    sig[pos] = tmp;
                    break;
                case 's':
                    sig = sig.slice(pos);
                    break;
                case 'p':
                    sig.splice(0, pos);
                    break;
            }
        }
        return sig.join('');
    }
}

const baseURL = 'https://www.youtube.com';
const store = new Map();
class infoGetter {
    async parse(itagURL) {
        const info = {
            'id': this.videoDetails.videoId,
            'title': this.videoDetails.title,
            'duration': this.videoDetails.lengthSeconds,
            'author': this.videoDetails.author,
        };
        const streams = {};
        info['streams'] = streams;
        if (this.error) {
            info['error'] = this.error;
            return info;
        }
        for (let item of this.streamingData.formats) {
            const itag = String(item.itag);
            const s = {
                "quality": item.qualityLabel || item.quality,
                "type": item.mimeType.replace(/\+/g, ' '),
                "itag": itag,
                "len": item.contentLength,
            };
            if (itagURL == itag) {
                s['url'] = await this.buildURL(item);
            }
            streams[itag] = s;
        }
        for (let item of this.streamingData.adaptiveFormats) {
            const itag = String(item.itag);
            const s = {
                "quality": item.qualityLabel || item.quality,
                "type": item.mimeType.replace(/\+/g, ' '),
                "itag": itag,
                "len": item.contentLength,
                "initRange": item.initRange,
                "indexRange": item.indexRange
            };
            if (itagURL == itag) {
                s['url'] = await this.buildURL(item);
            }
            streams[itag] = s;
        }
        return info;
    }
    async buildURL(item) {
        if (item.url) {
            return item.url;
        }
        const cipher = item.cipher ? item.cipher : item.signatureCipher;
        if (!cipher) {
            throw new Error("not found url or cipher");
        }
        const u = parseQuery(cipher);
        if (!u.url) {
            throw new Error("can not parse url");
        }
        return u.url + await this.signature(u);
    }
    async signature(u) {
        const sp = u.sp || "signature";
        if (u.s) {
            if (!this.jsPath) {
                throw new Error("jsPath not avaiable");
            }
            const d = new decipher(baseURL + this.jsPath, this.fetch);
            const sig = await d.decode(u.s);
            return `&${sp}=${sig}`;
        }
        else if (u.sig) {
            return `&${sp}=${u.sig}`;
        }
        else {
            throw new Error("can not decipher url");
        }
    }
}
class pageParser extends infoGetter {
    constructor(vid, fetch) {
        super();
        this.vid = vid;
        this.fetch = fetch;
        this.videoPageURL = `${baseURL}/watch?v=${vid}`;
    }
    async init() {
        let jsPath;
        const text = await this.fetch(this.videoPageURL);
        if (!text) {
            throw new Error("get page data failed");
        }
        const jsPathReg = text.match(/"jsUrl":"(\/s\/player.*?base.js)"/);
        if (jsPathReg && jsPathReg.length == 2) {
            jsPath = jsPathReg[1];
        }
        if (jsPath) {
            store.set("jsPath", jsPath);
        }
        const [videoDetails, streamingData] = this.extract(text);
        this.jsPath = jsPath || store.get("jsPath");
        this.videoDetails = videoDetails;
        this.streamingData = streamingData;
    }
    extract(text) {
        const arr = text.match(/ytInitialPlayerResponse\s+=\s+(.*}{3,});\s*var/);
        if (!arr || arr.length < 2) {
            throw new Error("initPlayer not found");
        }
        const data = JSON.parse(arr[1]);
        if (!data) {
            throw new Error("parse initPlayer error");
        }
        if (!data.streamingData || !data.videoDetails) {
            throw new Error("invalid initPlayer");
        }
        return [data.videoDetails, data.streamingData];
    }
}
class infoParser extends infoGetter {
    constructor(vid, fetch) {
        super();
        this.vid = vid;
        this.fetch = fetch;
        this.videoInfoURL = `${baseURL}/get_video_info?video_id=${vid}&html5=1`;
    }
    async init() {
        const infostr = await this.fetch(this.videoInfoURL);
        if (!infostr.includes('status') && infostr.split('&').length < 5) {
            throw new Error("get_video_info error :" + infostr);
        }
        const data = parseQuery(infostr);
        if (data.status !== 'ok') {
            throw new Error(`${data.status}:code ${data.errorcode},reason ${data.reason}`);
        }
        const player_response = JSON.parse(data.player_response);
        if (!player_response) {
            throw new Error("empty player_response");
        }
        const ps = player_response.playabilityStatus;
        if (['UNPLAYABLE', 'LOGIN_REQUIRED', 'ERROR'].includes(ps.status)) {
            // 私享视频 视频信息都获取不到,必须终止
            const { reason, errorScreen } = ps;
            let subreason = reason || ps.status;
            if (errorScreen && errorScreen.playerErrorMessageRenderer && errorScreen.playerErrorMessageRenderer.subreason) {
                const r = errorScreen.playerErrorMessageRenderer.subreason.runs;
                let s = '';
                if (r && r[0] && r[0].text) {
                    s = ' ' + r[0].text;
                }
                subreason += s;
            }
            subreason = subreason.replace(/\+/g, ' ');
            if (['LOGIN_REQUIRED', 'ERROR'].includes(ps.status)) {
                throw new Error(subreason);
            }
            this.error = subreason;
        }
        this.videoDetails = player_response.videoDetails;
        this.streamingData = player_response.streamingData;
        this.jsPath = store.get("jsPath");
    }
}
class parser {
    constructor(vid, fetch) {
        this.vid = vid;
        this.fetch = fetch;
        if (!vid || typeof fetch != 'function') {
            throw new Error("invalid params");
        }
    }
    async initParser() {
        try {
            const parser = new pageParser(this.vid, this.fetch);
            await parser.init();
            this.parser = parser;
        }
        catch (e) {
            console.error(e, ' , try infoParser');
            const parser = new infoParser(this.vid, this.fetch);
            await parser.init();
            this.parser = parser;
        }
    }
    async info() {
        if (!this.parser) {
            await this.initParser();
        }
        return await this.parser.parse();
    }
    async infoPart(itag) {
        if (!this.parser) {
            await this.initParser();
        }
        const info = await this.parser.parse(itag);
        const itagInfo = info.streams[itag];
        if (!itagInfo) {
            throw new Error(`itag ${itag} not found`);
        }
        return {
            'url': itagInfo['url']
        };
    }
}

class index extends parser {
    constructor(vid) {
        super(vid, ajax);
    }
}

var video = async req => {
    const matches = req.path.match(/\/video\/([\w\-]{6,12})\/(\d{1,3})\/(\d+-\d+)\.ts/);
    const vid = matches[1];
    const itag = matches[2];
    const cacheKey = `${vid}/${itag}`;
    let cacheItem = get(cacheKey);
    if (cacheItem) {
        const target = `${cacheItem.url}&range=${matches[3]}`;
        const { data, headers } = await fetch(target);
        return {
            statusCode: 200,
            headers: filterHeaders(headers, 864000),
            body: data,
        }
    }
    const start = +new Date();
    try {
        cacheItem = await videoURLParse(vid, itag);
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
    set(cacheKey, cacheItem);
    const target = `${cacheItem.url}&range=${matches[3]}`;
    const { data, headers } = await fetch(target);
    return {
        statusCode: 200,
        headers: filterHeaders(headers, `999${(+new Date() - start)}`),
        body: data,
    }
};


const videoInfo = async req => {
    const matches = req.path.match(/\/video\/([\w\-]{6,12})\.json/);
    const vid = matches[1];
    try {
        return await videoInfoParse(vid)
    } catch (e) {
        return {
            statusCode: 200,
            headers: filterHeaders({}, 3600),
            body: JSON.stringify({ code: -1, msg: e.message || e.stack || e })
        }
    }
};

const videoURLParse = async (vid, itag) => {
    const parser = new index(vid);
    const info = await parser.infoPart(itag);
    return info
};

const videoInfoParse = async (vid) => {
    const start = +new Date();
    let info = get(vid);
    if (!info) {
        const parser = new index(vid);
        info = await parser.info();
        set(vid, info);
    }
    return {
        statusCode: 200,
        body: JSON.stringify(info),
        headers: filterHeaders({ 'content-type': 'application/json' }, `9999${(+new Date() - start)}`)
    }
};

var index$1 = async (req, res) => {
    try {
        const r = new Router();
        r.get(/^\/video\/([\w\-]{6,12})\.(jpg|webp)$/, img);
        r.get(/^\/video\/([\w\-]{6,12})\.json$/, videoInfo);
        r.get(/^\/video\/([\w\-]{6,12})\/(\d{1,3})\/(\d+-\d+)\.ts$/, video);
        const { statusCode, headers, body } = await r.route(req);
        res.status(statusCode);
        for (const [k, v] of Object.entries(headers)) {
            res.setHeader(k, v);
        }
        res.send(body);
    } catch (e) {
        console.error(e);
    }
};

export default index$1;
