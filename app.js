if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const initPass = require('./passport-config');
const flash = require('express-flash');
const multer = require('multer');
const cors = require('cors');
const db = require('./db.js');
var favicon = require('serve-favicon');
var path = require('path')


initPass(passport,
  name => users.find(user => user.name === name),
  id => users.find(user => user.id === id)
);


const port = 1234;
const token = 121212

const users = [
  {
    id: 1,
    name: 'dev',
    email: 'dev@aether',
    password: '$2b$10$jNJizazegxB2ZuTCug9MxuiNEi6V4xWvVnTR58Aw7TJCeyomo/uhm',
    pfp: 'https://i.ibb.co/m8bCySY/83bc8b88cf6bc4b4e04d153a418cde62.jpg',
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

const titleFont = [
  "https://i.ibb.co/Qf51Qh4/adadwad.png",
  "https://i.ibb.co/rfTN95k/adwaaaaa.png",
  "https://i.ibb.co/jH1P3h4/aad.png",
  "https://i.ibb.co/QHtBt7H/adadd.png",
]

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
console.log(getRandomInt(4));

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
app.use(favicon(path.join(__dirname, 'views', 'data', 'favicon.ico')));

app.get('/', (req, res) => {
      if (req.isAuthenticated()) {
        res.render('index.ejs', {
          hub: 'hub', 
          font: titleFont[getRandomInt(4)],
          DUI: 'off',
          UUI: 'on',
          isUser: true,
          user: req.user,
        })
      } else {
        res.render('index.ejs', { 
        hub: ' ', 
        font: titleFont[getRandomInt(4)],
        DUI: 'on',
        UUI: 'off',
        isUser: false,
        user: 'login'
      })
      }
});
app.get('/login', (req, res) => {
  res.render('login.ejs')
});
app.get('/logout', (req, res) => {
  console.log('User '+ req.user.name + ' logged out');
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });

});
app.get('/register', (req, res) => {
  res.render('reg.ejs')
});
app.get('/doc', (req, res) => {
  res.render('docs.ejs')
});

app.get('/join', (req, res) => {
  res.render('join.ejs')
});
app.get('/user', checkAuth, (req, res) => {
  res.render('user.ejs', {
    user: req.user,
  })
});
app.get('/upload', (req, res) => {
  res.render('upload.ejs')
});
app.get('/hub', checkAuth, (req, res) => {

  res.render('hub.ejs', {
    user: req.user,
    spaces: req.user.spaces,
  })
});
app.get('/share/:link', (req, res) => {
  
});




app.post('/user/pfp', (req, res) => {
  for(let i in users) {
    if(req.user.id == users[i].id) {
      users[i].pfp = req.body.newpfp;
    }
  }
  res.redirect('/user')
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/hub',
  failureRedirect: '/login',
  failureFlash: true
}))
app.post('/register', async (req, res) => {
  if (req.body.token == token) {
    try {
      const hashpw = await bcrypt.hash(req.body.password, 10)
      users.push({
        id: users.length + 1,
        name: req.body.name,
        email: req.body.email,
        password: hashpw,
        pfp: 'https://i.ibb.co/m8bCySY/83bc8b88cf6bc4b4e04d153a418cde62.jpg',
        spaces: {}
      })
      res.redirect('/login')
    } catch (error) {
      res.redirect('/register')
    }
  } else {
    res.render('reg.ejs', {regerror: 'wrong token!'})
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

//upload_stuff
app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },

    // filename: function (req, file, callback) {
    //     callback(null, file.originalname);
    // }

  })


const upload = multer({ storage: storage })

app.post("/uploads", upload.array("files"), (req, res) => {

  var shareLink = randomString(30, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  var urlShareLink =`${req.headers.origin}/share/${shareLink}`;

  for(let i =0; i < req.files.length; i++) {
    db.fileUp(req.files[i].path, req.files[i].originalname, shareLink);
    
}
// qr_popup(shareLink)
res.json({ variable: urlShareLink });
    
});


function randomString(length, characters) {
  var result = '';
  var charactersLength = characters.length;
  
  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}
function getLink(){
  return shareLink
}

module.exports = {
  randomString,
};


app.listen(port,() => {
  console.log('Running at Port', port);
});