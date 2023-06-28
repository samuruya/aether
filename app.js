if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const session = require('express-session')
const initPass = require('./passport-config');
const flash = require('express-flash');

initPass(passport, 
  nickname => users.find(user => user.name === nickname)
);


const port = 3000;

const users = []

app.use(express.static(__dirname + '/views/data'));
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


app.get('/', (req, res) => {
      res.render('index.ejs')
});
app.get('/login', (req, res) => {
  res.render('login.ejs')
});
app.get('/register', (req, res) => {
  res.render('reg.ejs')
});


app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))
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