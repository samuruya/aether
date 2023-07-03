if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

var fs = require('fs');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt')
const passport = require('passport');
const session = require('express-session');
const initPass = require('./passport-config');
const flash = require('express-flash');
const multer = require('multer');
const cors = require('cors');
const db = require('./db.js');
var favicon = require('serve-favicon');
var path = require('path')
const http = require('http').createServer(app)

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

const port = 3000;
const token = 121212





const titleFont = [
  "https://i.ibb.co/Qf51Qh4/adadwad.png",
  "https://i.ibb.co/rfTN95k/adwaaaaa.png",
  "https://i.ibb.co/jH1P3h4/aad.png",
  "https://i.ibb.co/QHtBt7H/adadd.png",
]



async function connectDB() {
    console.log(makeid(4))
    try {
      await client.connect();
      console.log('client connected');
      const db = client.db(dbName);
      const collection = db.collection('users')
      const findResult = await collection.find().toArray()
      const finds = await collection.find({"spaces.Sid": "0"}).toArray()
      console.log(finds)
      for(const i in findResult) {
        users.push(findResult[i]);
      }
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
app.get('/space', checkAuth, (req, res) => {
  res.render('space.ejs')
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
app.get('/hub', checkAuth, async (req, res) => {
  refreshUser();
  const updatedUser = await getUsrById(req.user.Uid)
  console.log(updatedUser[0].spaces)
  var splength = 0
  if(updatedUser[0].spaces != []) {
    splength = updatedUser[0].spaces.length
  }
  res.render('hub.ejs', {
    user: updatedUser[0],
    spaces: updatedUser[0].spaces,
    long: splength
  })
});
app.post('/hub/addspace', checkAuth, async (req, res) => {
  var setSpaceName = ''
  var setSpaceId = makeid(5)
  if(req.body.spacename == '' ) {
    console.log('empty');
    setSpaceName = 'New Space'
  } else {
    setSpaceName = req.body.spacename;
  }

  try {
    await client.connect();
    console.log('client connected');
    const db = client.db(dbName);
    const collection = db.collection('users')
    const addt = await collection.updateOne({Uid: req.user.Uid}, {$push: {
      spaces: {
        Sid: setSpaceId,
        title: setSpaceName,
        body: []
      }
    }})
    console.log(addt)
  } catch(error) {
    console.error(error);
  }


  console.log(setSpaceName);
  console.log(setSpaceId)
  res.redirect('/hub')
})

app.post('/hub/delspace', checkAuth, async (req, res) => {
  console.log(req.body.delspace)
  try {
    await client.connect();
    console.log('client connected');
    const db = client.db(dbName);
    const collection = db.collection('users')
    console.log('#');
    console.log(req.body.delspace);
    console.log('#');
    const delt = await collection.updateOne(
      {Uid: req.user.Uid},
      { $pull: {spaces: {"Sid": req.body.delspace}}}
    )
    console.log(delt);
  } catch(error) {
    console.error(error);
  }

  res.redirect('/hub')
})

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

app.post('/space', async (req, res) => {
  const tempUser = await getUsrById(req.user.Uid)
  const spacesList = tempUser[0].spaces;
  const space = []
  if(spacesList[0].title == req.body.openSpace){
    console.log(spacesList[0]);
    space.push(spacesList[0]);
  }
  if(space.length != 0) {
    res.render('space.ejs', {
      space:  space[0],
      user: req.user
    })
  } else {
    console.log(space)
    console.log('bad input');
    res.redirect('/hub')
  }
})

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
  try {
    await client.connect();
    console.log('client connected');
    const db = client.db(dbName);
    const collection = db.collection('users')
    var tempUser = await collection.find({name: req.body.name}).toArray()
    console.log(tempUser)
    if(tempUser.length === 0 ) {
      if( 2 < req.body.name.length < 13) {
        if(req.body.password == req.body.password2) {
          if (req.body.token == token) {
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
        } else {
          res.render('reg.ejs', {regerror: 'Both Passwords need to match!'})
        }
      } else {
        res.render('reg.ejs', {regerror: 'your username needs to be between 3 and 12 Chars long'})
      }


    } else {
      res.render('reg.ejs', {regerror: 'Username is already taken!'})
    }

  } catch(error) {

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



async function getUsrById(id) {
  try {
    await client.connect();
    console.log('client connected');
    const db = client.db(dbName);
    const collection = db.collection('users')
    const findResult = await collection.find({ Uid: id}).toArray()
    return findResult;
  } catch (error) {
    console.error(error);
  }
}

async function getSpaceByIds( eUid, eSid) {
  try{
    await client.connect();
    console.log('client connected');
    const db = client.db(dbName);
    const collection = db.collection('users')
    const findusr = await collection.find({ Uid: eUid}).toArray()
    for(var i in findusr[0].spaces) {
      if(findusr[0].spaces[i].Sid = eSid){
        return findusr[0].spaces[i];
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function refreshUser() {
  users = []
  try {
    await client.connect();
    console.log('users reloaded');
    const db = client.db(dbName);
    const collection = db.collection('users')
    const findResult = await collection.find().toArray()
    for(const i in findResult) {
      users.push(findResult[i]);
    }
  } catch (error) {
    console.error(error);
    
  }
}


function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
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