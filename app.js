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
  name => users.find(user => user.name === name),
  id => users.find(user => user.id === id)
);


const port = 3000;

const users = [
  {
    id: 1,
    name: 'dev',
    email: 'dev@aether',
    password: '$2b$10$jNJizazegxB2ZuTCug9MxuiNEi6V4xWvVnTR58Aw7TJCeyomo/uhm',
    spaces: [
      {
        title: 'bpbpb'
      },
      {
        title: 'untitladwaded'
      },
      {
        title: 'untitlawdwadaed'
      },
    ]
  }
]

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
      if (req.isAuthenticated()) {
        res.render('index.ejs', {name: 'Hey '+req.user.name,  hub: 'hub'})
      } else {
        res.render('index.ejs', {name: ' ', hub: ' '})
      }
});
app.get('/login', (req, res) => {
  res.render('login.ejs')
});
app.get('/register', (req, res) => {
  res.render('reg.ejs')
});
app.get('/hub', checkAuth, (req, res) => {
  console.log(req.user);
  var temp = req.user
  res.render('hub.ejs', temp)
});


app.post('/login', passport.authenticate('local', {
  successRedirect: '/hub',
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
      password: hashpw,
      space: {}
    })
    res.redirect('/login')
  } catch (error) {
    res.redirect('/register')
  }
  console.log(users);
})


function checkAuth(req, res, next) {
  if(req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuth(req, res, next) {
  if(req.isAuthenticated()) {
    return res.redirect('/')
  }

  next()
}




app.listen(port,() => {
  console.log('Running at Port', port);

  console.log(users)
});