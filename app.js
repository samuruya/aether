
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static(__dirname + '/views/data'));


app.get('/', (req, res) => {
      res.render('index.ejs')
});


app.get('/login', (req, res) => {
  res.render('login.ejs')
});









app.listen(port,() => {
  console.log('Running at Port', port);
});