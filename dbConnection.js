
const mongodb = require('mongodb');
const dbName = 'authentication';
const dburl = `mongodb+srv://sunny:sunny@cluster0.ck6j4.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const mongoClient = mongodb.MongoClient

module.exports = {mongodb,dbName,dburl,mongoClient}