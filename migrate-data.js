const parallel = require('async/parallel');
const data = require('./m3-customer-data');
const addressData = require('./m3-customer-address-data');
const MongoClient = require('mongodb').MongoClient;
const mergeAllObjects = require('./helpers/merge.js');
const calculateTierSizes = require('./helpers/calculateTierSizes');
const insertDocuments = require('./query-modules/insertDocuments');

const migrateData = numberOfQueries => {
  const dataLength = data.length;
  const tiersInfo = calculateTierSizes(numberOfQueries, dataLength);
  const url = 'mongodb://localhost:27017/customer-db';
  const allObjects = mergeAllObjects(data, addressData);

  MongoClient.connect(url, (error, client) => {
    if(error) return process.exit(1);
    let queries = [],
        queryNum = 0,
        pointerObjs = 0,
        tierSize;

    for(let i = 0, tempDocs = []; i < numberOfQueries; i++, tempDocs = []) {
      (queryNum < tiersInfo.tier1) ? tierSize = tiersInfo.tier1Size : tierSize = tiersInfo.tier2Size;
      for(let y = 0; y < tierSize; y++) {
        tempDocs.push(allObjects[pointerObjs]);
        pointerObjs++;
      }
      let newQuery = async function(){
        console.log('finished query', i+1);
        insertDocuments(client, [...tempDocs]);
      }
      queries.push(newQuery);
      queryNum++;
    }

    parallel(queries, (err, res) => {
      if(err) return console.log(err);
      console.log('all queries executed');
    });
  });
}

migrateData(process.argv[2]);
