export function getParams(params) {
    let splitParams = {};
    for (var i = 1; i < params.length; i++) {
        let keyvalue = params[i].split('=');
        splitParams[keyvalue[0]] = keyvalue[1]
    }
    return splitParams;
}

export function call(call, params) {
    if (call[1] !== 'api') { //only accept this as the call
        return false;
    }

    console.log(params)
    let sql = 'select'
    if (params.count && params.count === 'true') {
        sql = sql + ' count(*) from items'
    } else {
        sql = sql + ' * from items'
    }
    if (params.search) {
        sql = sql + ' where name like "%' + params.search + '%"';
    }
    if (params.order) {
        if (params.order === 'desc') {
            sql = sql + ' order by id desc'
        } else if (params.order === 'asc') {
            sql = sql + ' order by id asc'
        } else if (params.order === 'lastupdated') {
            sql = sql + ' order by updated'
        }
    }
    if (params.limit) {
        sql = sql + ' limit ' + params.limit
    }
    return sql;
}