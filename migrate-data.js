const parallel = require('async/parallel');
const data = require('./m3-customer-data');
const addressData = require('./m3-customer-address-data');
const MongoClient = require('mongodb').MongoClient;
const mergeAllObjects = () => {
  const count = data.length;
  let completeObjects = [];
  for(let i = 0; i < count; i++) {
    let obj = Object.assign({}, data[i], addressData[i]);
    completeObjects.push(obj);
  }
  return completeObjects;
}

const insertDocuments = (client, docs) => {
  const collection = client.db('customer-db').collection('customers');
  collection.insert(docs, (err, res) => {
    if(err) {
      console.log('error in inserting')
      return process.exit(1);
    }
    console.log('successfully inserted');
    client.close();
  });
}

const calculateTierSizes = (numberOfQueries, jsonLength) => {
  let querySize;
  if(numberOfQueries < 1) {
    querySize = 1;
  } else if (numberOfQueries > jsonLength) {
    querySize = jsonLength;
  } else {
    querySize = numberOfQueries;
  }

  const baseDocsPerQuery = Math.floor(jsonLength / querySize);
  const tier1Size = baseDocsPerQuery + 1;
  const tier2Size = baseDocsPerQuery;
  let remain = jsonLength - baseDocsPerQuery * querySize;
  let tier1 = 0;
  let tier2 = 0;
  let count = querySize;
  while(count > 0) {
    remain > 0 ? tier1++ : tier2++
    remain--;
    count--;
  }
  return {
    tier1,
    tier2,
    tier1Size,
    tier2Size
  }
}

const migrateData = numberOfQueries => {
  const dataLength = data.length;
  const tiersInfo = calculateTierSizes(numberOfQueries, dataLength);
  const url = 'mongodb://localhost:27017/customer-db';
  const allObjects = mergeAllObjects();
  MongoClient.connect(url, (error, client) => {
    if(error) return process.exit(1);
    let queries = [];
    let queryNum = 0;
    let pointerObjs = 0
    let tierSize;
    for(let i = 0, tempDocs = []; i < numberOfQueries; i++, tempDocs = []) {
      (queryNum < tiersInfo.tier1) ? tierSize = tiersInfo.tier1Size : tierSize = tiersInfo.tier2Size;
      for(let y = 0; y < tierSize; y++) {
        tempDocs.push(allObjects[pointerObjs]);
        pointerObjs++;
      }
      let newQuery = () => {
        console.log('finished query', i+1);
        insertDocuments(client, [...tempDocs]);
      }
      queries.push(newQuery);
      queryNum++;
    }
    parallel(queries, (err, res) => {
      if(err) return console.log(err);
      console.log('ok');
    });
  });
}

migrateData(process.argv[2]);
