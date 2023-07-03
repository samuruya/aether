if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const session = require('express-session');
const initPass = require('./passport-config');
const flash = require('express-flash');
const multer = require('multer');
const cors = require('cors');
const db = require('./db.js');
var favicon = require('serve-favicon');
var path = require('path')

const { MongoClient } = require("mongodb");
const { log } = require('console');
const uri = process.env.MDB_HOSTED_KEY;

const dbName = 'aether';
const client = new MongoClient(uri);

var users = []

initPass(passport,
  name => users.find(user => user.name === name),
  Uid => users.find(user => user.Uid === Uid)
);

const port = 80;
const token = 121212



const titleFont = [
  "https://i.ibb.co/Qf51Qh4/adadwad.png",
  "https://i.ibb.co/rfTN95k/adwaaaaa.png",
  "https://i.ibb.co/jH1P3h4/aad.png",
  "https://i.ibb.co/QHtBt7H/adadd.png",
]



async function connectDB() {
    try {
      await client.connect();
      console.log('client connected');
      const db = client.db(dbName);
      const collection = db.collection('users')
      const findResult = await collection.find().toArray()
      for(const i in findResult) {
        users.push(findResult[i]);
      }
      console.log(users)
    } catch (error) {
      console.error(error);

    }
}


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
app.get('/share', async (req, res) => { /* '/share/:link' */
  const link = req.query.link;  
  // res.render('download.ejs')
  try {
    // const link = req.query.link;
    console.log(link)
    const files = await db.fileDown(link);

    for (const file of files) {
    const { originalName, path } = file;
    console.log('Original Name:', originalName);
    console.log('Path:', path);
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
      res.download(path);
    }

    

  } catch (err) {
    console.error(err);
    // res.status(500).send('Internal Server Error');
  }
  res.render('download.ejs')
});




app.post('/user/pfp', async (req, res) => {
  console.log('/user/pfp');
  for(let i in users) {
    if(req.user.Uid == users[i].Uid) {
      users[i].pfp = req.body.newpfp;
    }
  }
  try{
    await client.connect();
    console.log('client connected');
    const db = client.db(dbName);
    const collection = db.collection('users')
    const updatedResult = await collection.updateOne({Uid: req.user.Uid}, {$set: {pfp: req.body.newpfp}})
    console.log(updatedResult)
  } catch (error){
    console.error(error);
  }
  res.redirect('/user')
})

app.post('/user/disc', async (req, res) => {
  for(let i in users) {
    if(req.user.Uid == users[i].Uid) {
      users[i].disc = req.body.disc;
    }
  }
  try{
    await client.connect();
    console.log('client connected');
    const db = client.db(dbName);
    const collection = db.collection('users')
    const updatedResult = await collection.updateOne({Uid: req.user.Uid}, {$set: {disc: req.body.disc}})
    console.log(updatedResult)
  } catch (error){
    console.error(error);
  }
  res.redirect('/user')
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/hub',
  failureRedirect: '/login',
  failureFlash: true
}))
app.post('/register', async (req, res) => {
  if (req.body.token == token && req.body.password == req.body.password2) {
    try {
      const hashpw = await bcrypt.hash(req.body.password, 10)
      //database user register
      await client.connect();
      console.log('client connected');
      const db = client.db(dbName);
      const collection = db.collection('users')
      collection.insertOne({
      Uid: users.length +1,
      name: req.body.name,
      email: req.body.email,
      password: hashpw,
      pfp:"https://i.ibb.co/m8bCySY/83bc8b88cf6bc4b4e04d153a418cde62.jpg",
      disc:"im a user!",
      spaces:
            [
              {
                 title:"new space"
              }
            ] 
      })
      users = []
      const findResult = await collection.find().toArray()
      for(const i in findResult) {
        users.push(findResult[i]);
      }
      console.log(users)
      res.redirect('/login')
    } catch (error) {
      res.redirect('/register')
    }
  } else {
    res.render('reg.ejs', {regerror: 'wrong token!'})
  }

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
  var urlShareLink =`${req.headers.origin}/share?link=${shareLink}`; //Localhost: req.headers.origin
  

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
function downloadFiles(link){
  const fileData = db.fileDown(link);

  fileData.then((files) => {
    for (const file of files) {
      const { originalName, path } = file;
      console.log('Original Name:', originalName);
      console.log('Path:', path);
      res.download(path, originalName)
    }
  }).catch((err) => {
    console.error(err);
  });
}

module.exports = {
  randomString,
};


app.listen(port,() => {
  connectDB();
  console.log('Running at Port', port);
});