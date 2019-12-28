const Sign = require('./sign')


const opensearch = {

    appName: 'test_opensearch',
    tableName: 'tableName',

    access: {
        id: 'accessid',
        secret: 'accesssecret',
    },

    url: {
        domain: 'http://opensearch-cn-qingdao.aliyuncs.com',
        base: '/v3/openapi/apps',
        bulk: '/actions/bulk',
        search: '/search',
        info: '',
    },

}
const sign = new Sign(opensearch)


function bulk() {

    const PostDataStr = "[{\"fields\": {\"id\": 1,\"name\": \"test键盘上所有特殊符号 ~ ` ! @ # $ % ^ & * ( ) _ + - = { } | [ ] \\\\: \\\" ; ' < > ? , . / 和数字1234567890\",\"phone\": \"18312345678\",\"int_arr\": [1,2],\"literal_arr\": [\"类别1\",\"类别2\"],\"float_arr\": [1.1,2.2],\"cate_id\": 1},\"cmd\": \"ADD\"}]";
    const body = {
        flag: 'bulk',
        verb: 'POST',
        request: PostDataStr,
    }

    const data = sign.signature(body);
    console.log('----------bulk-------->', data);


}

function get() {

    const search = {
        query: "name:'test键盘上所有特殊符号 ~ ` ! @ # $ % ^ & * () _ + - = { } | [ ] \\\\ : \" ; \\\' < > ? , . ~ / 和数字1234567890'",
        config: 'start:0,hit:1,format:fulljson',
        sort: 'id',
    }

    const body = {
        flag: 'search',
        verb: 'GET',
        request: {
            query: sign.joinValue(search, '&&'),
            fetch_fields: 'name',
        },
    }

    const data = sign.signature(body);
    console.log('----------get-------->', data);
}

bulk()

get()