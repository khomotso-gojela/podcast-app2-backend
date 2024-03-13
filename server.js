const express = require('express')
const { MongoClient } = require('mongodb')
const cors = require('cors')

// EXPRESS
const app = express()

app.use(express.json())
app.use(cors())

const port = 4001

app.listen(port, () => {
    console.log(`server started on port: ${port}`)
})

app.get('/previews',async (req,res) => {
    // console.log(dbConnection(getPreviews))
    res.send(await dbConnection(getPreviews))
})

app.get('/show/:id',async (req,res) => {
    const {id} = req.params
    res.send(await dbConnection(getShow,id))
})

app.get('/favorites',async (req,res) => {
    // console.log(dbConnection(getPreviews))
    res.send(await dbConnection(getFavorites))
})

app.post('/update/:id',async (req,res) => {
    const {id} = req.params
    console.log(req.body)
    const results = await dbConnection(updateFav,id,req.body)
    res.send(results)
})

app.post('/newfavorite',async (req,res) => {
    const {body} = req
    const results = await dbConnection(addNewFav,body)
    res.send(results)
})

// MONGODB

const uri = 'mongodb://localhost:27017/'
const URI2 = 'mongodb+srv://motso:motso123@mycluster.vjpdmui.mongodb.net/?retryWrites=true&w=majority'

async function dbConnection(func,id,body) {

    const client = new MongoClient(URI2, {monitorCommands: true})

    try {
        await client.connect()

        const res = await func(client,id,body)
        return await res
        
    } catch (error) {
        console.log(error.message)
        
    } finally {
        await client.close()
    }
}

// get previews
async function getPreviews(client) {
    const cursur = await client.db('mocastdb').collection('previews').find()
    return await cursur.toArray()
}

// get favorite shows
async function getFavorites(client) {
    const cursur = await client.db('mocastdb').collection('favorites').find()
    return await cursur.toArray()
}

// get show by id
async function getShow(client,id) {
    const res = await client.db('mocastdb').collection('shows').findOne({_id:id})
    return res
}

// update favorite show
async function updateFav(client,id,obj) {
    const res = await client.db('mocastdb').collection('favorites')
        .updateOne(
            {_id:id},
            {$set:{seasons: obj.seasons}},
            {upsert:true}
            )
    console.log(res,id)
}

async function addNewFav(client,obj) {
    const res = await client.db('mocastdb').collection('favorites')
        .insertOne(obj)
    console.log(res)
}



