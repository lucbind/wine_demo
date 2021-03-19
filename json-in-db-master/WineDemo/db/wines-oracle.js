

var oracledb = require('oracledb');

var config = {
  user: process.env.NODE_ORACLEDB_USER || "scott",
  password: process.env.NODE_ORACLEDB_PASSWORD || "tiger",
  connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "172.17.0.2/orclpdb",
  poolMin: 10,
  poolMax: 10,
  poolIncrement: 0
}

async function initialize() {
  oracledb.autoCommit = true;
  await oracledb.createPool(config);
  var conn = await oracledb.getConnection();
  var soda = conn.getSodaDatabase();
  var collection = await soda.createCollection('wines');
  await collection.createIndex({ "name" : "WINE_IDX" });
}

async function close() {
  await oracledb.getPool().close();
}

async function get(qbe) {
  var conn = await oracledb.getConnection();
  var collection = await getCollection(conn);
  var builder = collection.find();
  if (qbe != null) {
    builder.filter(JSON.parse(qbe));
  }
  var docs = await builder.getDocuments();
  var res = toJSON(docs);
  conn.close();
  return res;
}

async function update(id, review) {
  delete review.id;
  var conn = await oracledb.getConnection();
  var collection = await getCollection(conn);
  var result = await collection.find().key(id).replaceOne(review);
  conn.close();
  return result;
}

async function discount() {
     
  var conn = await oracledb.getConnection();
  var collection = await getCollection(conn);
   let sql = `  UPDATE wines w SET w.json_document = json_transform(w.json_document, SET '$.price' = w.json_document.price.number()*0.7 ) 
   WHERE w.json_document.price.number() > 10 AND w.json_document.country='Italy'`;
 const result= await conn.execute(sql);
    conn.close();
  return result;
}

async function exists() {

var conn = await oracledb.getConnection();
var collection = await getCollection(conn);
let sql = `  
SELECT JSON_QUERY(json_document,
  ' $.name' 
  with wrapper) 
FROM  wines w
WHERE JSON_EXISTS( json_document,
  ' $.region?(@.country like "%Spain%")' ) AND  JSON_EXISTS( json_document,
  '$.notes[*]?(@.rate > 4.5) ')
`;
const result= await conn.execute(sql);
//if (result.rows.length) {
if (result.rows.length > 0) {
  var i=1;
  console.log('Rate > 4.5 and From Spain');
  while(i<result.rows.length  ){
    js = JSON.parse(result.rows[i]);
  console.log('The name is: ' + js);
    i++;
  }

} else {
  console.log('No rows fetched');
}

conn.close();
return result;
}


async function create(review) {
  var conn = await oracledb.getConnection();
  var collection = await getCollection(conn);
  var result = await collection.insertOneAndGet(review);
  var key = result.key;
  conn.close();
  return key;
}

async function remove(id) {
  var conn = await oracledb.getConnection();
  var collection = await getCollection(conn);
  var res = await collection.find().key(id).remove();
  conn.close();
}

function code() {
  str = `    var wine = request.body;
    var id = wine.id;
    var soda = conn.getSodaDatabase();
    var collection = await soda.openCollection("wines");
    await collection.find().key(id).replaceOne(wine);
`;
  return JSON.stringify({"value":str});
}

async function getCollection(conn) {
  var soda = conn.getSodaDatabase();
  return await soda.openCollection('wines');
}

function toJSON(documents) {
  var result = [];
  for (let i = 0; i < documents.length; i++) {
    var doc = documents[i];  // the document (with key, metadata, etc)
    var key = doc.key;     
    content = doc.getContent();
    content.id = key;        // inject key into content 
    result.push(content);
  }
  return result;
}

module.exports.initialize = initialize;
module.exports.close = close;
module.exports.get = get;
module.exports.update = update;
module.exports.discount = discount;
module.exports.exists = exists;
module.exports.create = create;
module.exports.remove = remove;
module.exports.code = code;
