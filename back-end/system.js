import * as libs from "../scripts/libs.js";

export async function getItems(args) {
  let search = "";
  let limit = 1000;
  let offset = 0;
  let orderby = "id";
  let order = "asc";

  if (args.search) search = args.search;
  if (args.limit) limit = args.limit;
  if (args.orderby) orderby = args.orderby;
  if (args.order) order = args.order;
  if (args.offset) offset = args.offset;

  if (order !== 'desc' && order !== 'asc')
    return 'order has to be desc or asc'

  const condition = `where name like '%${search}%' order by ${orderby} ${order} limit ${limit} offset ${offset}`;
  const data = await libs.select("production", "items", condition);
  console.log(data)
  return data;
}

export async function getCount(args) {
  let search = "";

  if (args.search) search = args.search;

  const condition = `COUNT where name like '%${search}%'`;
  const data = await libs.count("production", "items", condition);
  return data;
}