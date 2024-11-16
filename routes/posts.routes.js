const { MongoClient } = require("mongodb");
const express = require('express')
const router = express.Router()
const getId = require('../functions.js')

const uri = "" // put your string connection here;

const client = new MongoClient(uri);
const db = client.db('blog')
const postsCollection = db.collection('posts')

router.post('/', async (req, res) => {
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

router.put('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
  let id = parseInt(req.params.id)

  let result = await postsCollection.deleteOne({id})

  if(result.deletedCount) {
    res.sendStatus(204)
  } else {
    res.sendStatus(404)
  }
})

router.get('/:id', async (req, res) => {
  let id = parseInt(req.params.id)

  posts = postsCollection.find({id})

  posts = await posts.toArray()

  if(!posts.length > 0) {
    res.status(404).send()
  } else {
    res.status(200).send(posts)
  }
})

router.get('/', async (req, res) => {
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

module.exports = router