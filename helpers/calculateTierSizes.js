module.exports = (numberOfQueries, jsonLength) => {
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
