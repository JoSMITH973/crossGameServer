const express = require('express')
// const { reset } = require('yargs')
const app = express()
const port = 3000
const http = require('http');
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})
app.get('/yo', (req,res) => {
    res.send('test ok')
    console.log("test ok en console")
})

app.post('/postt', (req,res) =>{
    res.send('test post')
})




server.listen(port, () => {
  console.log(`server listening on port:${port}`)
})