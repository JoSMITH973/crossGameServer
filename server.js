const express = require('express')
// const { reset } = require('yargs')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/yo', (req,res) => {
    res.send('test ok')
    console.log("test ok en console")
})

app.post('/postt', (req,res) =>{
    res.send('test post')
})




app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})