
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const port = 3000;

const users = []

app.use(express.static(__dirname + '/views/data'));
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))


app.get('/', (req, res) => {
      res.render('index.ejs')
});
app.get('/login', (req, res) => {
  res.render('login.ejs')
});
app.get('/register', (req, res) => {
  res.render('reg.ejs')
});


app.post('/login', (req, res) => {

})
app.post('/register', async (req, res) => {
  try {
    const hashpw = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: users.length + 1,
      name: req.body.name,
      email: req.body.email,
      password: hashpw
    })
    res.redirect('/login')
  } catch (error) {
    res.redirect('/register')
  }
  console.log(users);
})




app.listen(port,() => {
  console.log('Running at Port', port);
});