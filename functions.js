const { MongoClient } = require("mongodb");

const uri = "" // put your string connection here;

const client = new MongoClient(uri);
const db = client.db('blog')
const postsCollection = db.collection('posts')

async function getId () {
  let posts = await postsCollection.find().toArray()

  posts.sort(function (a, b) {return a.id - b.id});
  let previousId = 0;
  for (let element of posts) {
    if (element.id != (previousId + 1)) {
      return previousId + 1;
    }
    previousId = element.id;
  }
  
  return previousId + 1;
}

module.exports = getId