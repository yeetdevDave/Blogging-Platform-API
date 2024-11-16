const { MongoClient } = require("mongodb");
const express = require('express')
const qs = require('qs')
const path = require('path')
const app = express()
const router = require('./routes/posts.routes.js')
const port = 3000

app.set('query parser',
  (str) => qs.parse(str, { /* custom options */ }))
app.use(express.json())

app.use('/posts', router)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})