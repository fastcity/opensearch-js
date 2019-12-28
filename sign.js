const crypto = require('crypto')

class SignService {

    constructor(op) {
        this.opensearch = op
    }

    signature(body) {
        const nonce = this.nonce()

        const {
            flag = 'search',
            verb = 'GET',
            // contentMd5 = this.md5Body(),
            contentType = 'application/json',
            date = this.getDate(),
            canonicalizedopensearchheaders = `x-opensearch-nonce:${nonce}`,
            request,
        } = body

        // const verb = flag !== 'bulk' ? 'GET' : 'Push'

        const canonicalizedresource = this.getcanonicalizedresource(request, flag)
        const contentMd5 = this.md5Body(verb, request)

        const { id, secret } = this.opensearch.access

        // Signature = base64(hmac - sha1(AccessKeySecret,
        //     VERB + "\n"
        //     + Content - Md5 + "\n"
        //     + Content - Type + "\n"
        //     + Date + "\n"
        //     + CanonicalizedOpenSearchHeaders
        //     + CanonicalizedResource))

        const str = [verb, contentMd5, contentType, date, canonicalizedopensearchheaders, canonicalizedresource].join('\n')

        const si = crypto.createHmac('sha1', secret)
            .update(str, 'utf8')
            .digest()
            .toString('base64');

        const header = {
            VERB: verb,
            'Content-MD5': contentMd5,
            'Content-Type': 'application/json',
            Authorization: `OPENSEARCH ${id}:${si}`,
            'X-Opensearch-Nonce': nonce,
            Date: date,
        }
        return { header, requestUrl: canonicalizedresource }
    }

    md5Body(method, request) {
        if (method === 'GET') {
            return ''
        }
        const b = request

        const result = crypto.createHash('md5').update(b, 'utf8').digest('hex');

        return result

    }

    getDate() {
        // return '2019-12-06T12:30:26Z'
        let time = new Date().toISOString()
        time = time.split('.')[0] + 'Z'
        return time
    }

    nonce() {
        // return '157561285289350'
        return Date.now() + Math.floor(Math.random() * 100000)
    }


    //  三种 bulk 、 search 、suggest 、 app 应用(version)
    getcanonicalizedresource(request, flag) {

        const { appName, tableName, url } = this.opensearch

        const { base, search, bulk } = url


        let path
        if (flag.toLowerCase() === 'bulk') {
            path = `${base}/${appName}/${tableName}${bulk}`;
            console.log('------------', path);

            path = encodeURIComponent(path).replace(/%2[f|F]/g, () => '/') // /v3/openapi/apps/app_name/table_name/actions/bulk

            return path
        }

        if (flag.toLowerCase() === 'search') {
            path = `${base}/${appName}${search}`;
            path = encodeURIComponent(path).replace(/%2[f|F]/g, () => '/')
            const str = this.sort(request, true)
            // str = this.fixedEncodeURIComponent(str)
            path = path + '?' + str
            return path
        }

        if (flag.toLowerCase() === 'suggest') {
            path = `${base}/${appName}/suggest`;
            path = encodeURIComponent(path).replace(/%2[f|F]/g, () => '/')
            const str = this.sort(request, true)
            // str = this.fixedEncodeURIComponent(str)
            path = path + '?' + str
            return path
        }

        if (flag.toLowerCase() === 'version') {
            // 查看app 信息
            path = `${base}/${appName}`;
            path = encodeURIComponent(path).replace(/%2[f|F]/g, () => '/')
            return path
        }

    }

    sort(request, encodeURI = false) {
        return this.joinValue(request, '&', true, encodeURI)
    }

    // 拼接query 参数
    joinValue(request, joinStr = '&', sort = false, encodeURI = false) {
        let str = ''
        if (!request) {
            return str
        }
        let keys = Object.keys(request)
        keys = sort ? keys.sort() : keys
        for (const k of keys) {
            if (request[k]) {
                str += `${joinStr}${k}=${encodeURI ? this.fixedEncodeURIComponent(request[k]) : request[k]}`;
            }
        }
        str = str.substring(joinStr.length)

        return str
    }


    fixedEncodeURIComponent(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
    }
}

module.exports = SignService
