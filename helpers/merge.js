module.exports = (obj1, obj2) => {
  const count = obj1.length;
  let completeObjects = [];
  for(let i = 0; i < count; i++) {
    let obj = Object.assign({}, obj1[i], obj2[i]);
    completeObjects.push(obj);
  }
  return completeObjects;
}
