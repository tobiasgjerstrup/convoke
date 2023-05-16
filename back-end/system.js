import * as libs from "../scripts/libs.js";
import * as bcrypt from "bcrypt";

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

  if (order !== "desc" && order !== "asc") return "order has to be desc or asc";

  const condition = `where name like '%${search}%' order by ${orderby} ${order} limit ${limit} offset ${offset}`;
  const data = await libs.select("production", "items", condition);
  return data;
}

export async function getCount(args) {
  let search = "";

  if (args.search) search = args.search;

  const condition = `COUNT where name like '%${search}%'`;
  const data = await libs.count("production", "items", condition);
  return data;
}

export async function getCommits(args) {
  let search = "";
  let limit = 1000;
  let offset = 0;
  let orderby = "date";
  let order = "desc";

  if (args.search) search = args.search;
  if (args.limit) limit = args.limit;
  if (args.orderby) orderby = args.orderby;
  if (args.order) order = args.order;
  if (args.offset) offset = args.offset;

  if (order !== "desc" && order !== "asc") return "order has to be desc or asc";

  const condition = `where message like '%${search}%' order by ${orderby} ${order} limit ${limit} offset ${offset}`;
  const data = await libs.select("production", "gitCommits", condition);
  return data;
}

export async function hashValue(value) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(value, salt);
  console.log(hash);
  return hash;
}

export async function compareHashWithValue(value, hash) {
  const result = await bcrypt.compare(value, hash);
  console.log(result);
  return result;
}
