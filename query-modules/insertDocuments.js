module.exports = (client, docs) => {
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
