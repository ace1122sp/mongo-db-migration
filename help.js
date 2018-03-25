


for(let i = 0; tempDocs = []; i < numberOfQueries; i++, tempDocs = []) {
  tempDocs = allObjects.slice(pointerObjs, pointerObjs + parseInt(numberOfObjectsInBatch));
  let newQuery = async function() {
    insertDocuments(client, [...tempDocs]);
    console.log('called query', i+1);
  }
  queries.push(newQuery);
  pointerObjs += numberOfObjectsInBatch;
}
