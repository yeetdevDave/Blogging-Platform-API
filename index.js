const { MongoClient } = require("mongodb");
const express = require('express')
const qs = require('qs')
const path = require('path')
const app = express()
const port = 3000

app.set('query parser',
  (str) => qs.parse(str, { /* custom options */ }))
app.use(express.json())

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

app.post('/posts', async (req, res) => {
  let id = await getId()
  let date = new Date().toISOString()

  let post = {
    id,
    ...req.body,
    createdAt: date,
    updatedAt: date
  }
  
  await postsCollection.insertOne(post)

  res.status(201).send(post)
})

app.put('/posts/:id', async (req, res) => {
  let id = parseInt(req.params.id)
  let body = req.body

  await postsCollection.updateOne(
    { id },
    {
      $set: { 
        'title': body.title,
        'content': body.content,
        'category': body.category,
        'tags': body.tags
      },
      $currentDate: { updatedAt: true }
    }
  )

  let post = await postsCollection.findOne({id})

  if(!post) {
    res.status(404).send()
  } else {
    res.status(200).send(post)
  }
})

app.delete('/posts/:id', async (req, res) => {
  let id = parseInt(req.params.id)

  let result = await postsCollection.deleteOne({id})

  if(result.deletedCount) {
    res.sendStatus(204)
  } else {
    res.sendStatus(404)
  }
})

app.get('/posts/:id', async (req, res) => {
  let id = parseInt(req.params.id)

  posts = postsCollection.find({id})

  posts = await posts.toArray()

  if(!posts.length > 0) {
    res.status(404).send()
  } else {
    res.status(200).send(posts)
  }
})

app.get('/posts', async (req, res) => {
  let posts
  let term = req.query.term

  if(term) {
    const pipeline = [
      {
        $search: {
          index: 'default',
          text: {
            query: term,
            path: ['title', 'content', 'category']
          }
        }
      }
    ]

    posts = postsCollection.aggregate(pipeline)
  } else {
    posts = postsCollection.find()
  }

  posts = await posts.toArray()

  if(!posts.length > 0) {
    res.status(404).send()
  } else {
    res.status(200).send(posts)
  }
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})