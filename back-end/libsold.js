import shelljs from "shelljs";

export function getParams(params) {
  let splitParams = {};
  for (var i = 1; i < params.length; i++) {
    let keyvalue = params[i].split("=");
    splitParams[keyvalue[0]] = keyvalue[1];
  }
  return splitParams;
}

export function call(call, params) {
  if (call[1] !== "api") {
    //only accept this as the call
    return false;
  }
  switch (params.table) {
    case "gitcommits":
      params.table = "gitCommits";
      var res = getGitCommits(params);
      return res;
      break;
    default:
      if (params.webhook) {
        pull();
        return "webhook started";
      }
      params.table = "items";
      var res = getItems(params);
      return res;
      break;
  }
  return "error in call function";
}

export function modifyData(value, params) {
  if (params.table) {
    if (params.table === "gitCommits") {
      value.forEach((element) => {
        element.date = element.date.toLocaleString();
      });
    }
  }
  return value;
}

function getGitCommits(params) {
  let sql = "select";
  if (params.count && params.count === "true") {
    sql = sql + " count(*) from " + params.table;
  } else {
    sql = sql + " * from " + params.table;
  }
  if (params.search) {
    sql = sql + ' where name like "%' + params.search + '%"';
  }
  if (params.order) {
    if (params.order === "desc") {
      sql = sql + " order by message desc";
    } else if (params.order === "asc") {
      sql = sql + " order by message asc";
    } else if (params.order === "date") {
      sql = sql + " order by date";
    }
  }
  if (params.limit) {
    sql = sql + " limit " + params.limit;
    if (params.offset) {
      sql = sql + " offset " + params.offset;
    }
  }
  return sql;
}
function getItems(params) {
  let sql = "select";
  if (params.count && params.count === "true") {
    sql = sql + " count(*) from " + params.table;
  } else {
    sql = sql + " * from " + params.table;
  }
  if (params.search) {
    sql = sql + ' where name like "%' + params.search + '%"';
  }
  if (params.order) {
    let order = "";
    let ascDesc = "";
    if (params.order.includes("-")) {
      order = params.order.split("-")[0];
      ascDesc = params.order.split("-")[1];
    } else {
      order = params.order;
    }

    if (order === "id" || order === "name" || order === "icon" || order === "class" || order === "subclass" || order === "quality" || order === "last_update" || order === "created") {
      sql = sql + ` order by ${order}`;
      if ((ascDesc === "desc")) {
        sql = sql + " desc";
      }
    }
  }
  if (params.limit) {
    sql = sql + " limit " + params.limit;
    if (params.offset) {
      sql = sql + " offset " + params.offset;
    }
  }
  return sql;
}

function pull() {
  shelljs.exec("git pull; pm2 restart database");
}
