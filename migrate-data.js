const parallel = require('async/parallel');
const MongoClient = require('mongodb').MongoClient;
const data = require('./m3-customer-data');
const addressData = require('./m3-customer-address-data');
const mergeAllObjects = require('./helpers/merge.js');
const insertDocuments = require('./helpers/insertDocuments');

const migrateData = numberOfObjectsInABatch => {
  const batchSize = parseInt(numberOfObjectsInABatch);
  const url = 'mongodb://localhost:27017/customer-db';
  const allObjects = mergeAllObjects(data, addressData);
  const dataLength = data.length;
  let numberOfQueries = Math.ceil(dataLength / batchSize);

  MongoClient.connect(url, (error, client) => {
    if(error) {
      console.error(error);
      return process.exit(1);
    }
    let queries = [],
        pointerObjs = 0;

    // query functions factory
    for(let i = 0, tempDocs = []; i < numberOfQueries; i++, tempDocs = []) {
      tempDocs = allObjects.slice(pointerObjs, pointerObjs + batchSize);
      let newQuery = async function() {
        insertDocuments(client, [...tempDocs]);
        console.log('called query', i+1);
      }
      queries.push(newQuery);
      pointerObjs += batchSize;
    }

    console.log(`Launching ${numberOfQueries} parallel task(s)...`);
    const startTime = Date.now();

    parallel(queries, (err, res) => {
      if(err) return console.log(err);
      const endTime = Date.now();
      console.log(`execution time: ${endTime - startTime}`)
      console.log('all queries executed');
      client.close();
    });
  });
}

migrateData(process.argv[2]);
