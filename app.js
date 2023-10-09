if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const fs = require('fs');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt')
const passport = require('passport');
const session = require('express-session');
const initPass = require('./passport-config');
const flash = require('express-flash');
const multer = require('multer');
const cors = require('cors');
const archiver = require('archiver');
const os = require('os');
var favicon = require('serve-favicon');
var path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const { MongoClient, Timestamp } = require("mongodb");
const { log, Console } = require('console');
const uri = process.env.MDB_HOSTED_KEY;

const dbName = 'aether';
const client = new MongoClient(uri);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use('/public/pfp_img', express.static(path.join(__dirname, 'public/pfp_img')));
app.use('/socket', express.static(__dirname + '/node_modules/socket.io/client-dist'));

var users = []

initPass(passport,
  name => users.find(user => user.name === name),
  Uid => users.find(user => user.Uid === Uid)
);

const port = 3000;
const token = process.env.REG_TOKEN





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
      const db = client.db(dbName);
      const collection = db.collection('users')
      const findResult = await collection.find().toArray()
      const finds = await collection.find({"spaces.Sid": "0"}).toArray()

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
        res.redirect('/hub')
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
  res.redirect('/hub')
});
app.get('/join', (req, res) => {
  res.render('join.ejs')
});
app.get('/user', checkAuth, async (req, res) => {


const tempUser = await getUsrById(req.user.Uid)
const tempFl = tempUser[0].Fl;


if(tempFl != null) {
    var Fl = [];
    for(var i in tempFl) {
      const tempMate = await getUsrById(tempFl[i])
      const fri = {
        Fid: tempMate[0].Uid,
        tag: tempMate[0].tag,
        pfp: tempMate[0].pfp
      }
      Fl.push(fri)
    }
  }
  res.render('user.ejs', {
    user: req.user,
    Fl: Fl
  })
});
app.get('/upload',checkAuth , async (req, res) => {
  const urlString = `${getDomain()}/uploads`;

  refreshUser();
  const updatedUser = await getUsrById(req.user.Uid)
  var splength = 0
  if(updatedUser[0].spaces != []) {
    splength = updatedUser[0].spaces.length
  }

  res.render('upload.ejs', { 
    urlString : urlString,
    user: updatedUser[0]
  })
});
app.get('/hub', checkAuth, async (req, res) => {
  const updatedUser = await getUsrById(req.user.Uid)
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
    setSpaceName = 'New Space'
  } else {
    setSpaceName = req.body.spacename;
  }

  const tempUser = await getUsrById(req.user.Uid)
  console.log(tempUser[0].spaces.length);
  if(tempUser[0].spaces.length < 9) {
    try {
      await client.connect();
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
  } else {
  }
  res.redirect('/hub')
})
app.post('/hub/delspace', checkAuth, async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('users')
    const delt = await collection.updateOne(
      {Uid: req.user.Uid},
      { $pull: {spaces: {"Sid": req.body.delspace}}}
    )
    console.log(delt);
  } catch(error) {
    console.error(error);
  }
  await refreshUser()

  res.redirect('/hub')
})

app.get('/share', async(req, res) => {
  const link = req.query.link;

  try{
  
    await client.connect();
    console.log('client connected');

    const db = client.db(dbName);
    const collection = db.collection('files');
    const files = await collection.find({ url: link }).toArray();

    files.forEach(file => {
      console.log('Original Name:', file.originalName);
    });


    const filesData = JSON.stringify(files);

    const error = "couldn't  retrieve files :(";

    if(files.length > 0){
      res.render('download.ejs', { link, files: files });
    }else{
      res.render('error_msg.ejs', { error });
    }


  }catch (error) {
    console.error('Error:', error);
    res.render('error_msg.ejs', { error });
  }

 
});

app.get('/share/d', async (req, res) => {
  const link = req.query.link;
  console.log('link: ' + link);

  try {
    await client.connect();
    console.log('client connected');

    const db = client.db(dbName);
    const collection = db.collection('files');
    const files = await collection.find({ url: link }).toArray();

    if (files.length === 1) {
      console.log('Original Name:', files[0].originalName);
      console.log('Path:', files[0].path);
      res.download(files[0].path, files[0].originalName);
      return;
    } else if (files.length > 1) {
      const tmpFileName = './public/temp/files.zip';
      const output = fs.createWriteStream(tmpFileName);
      const archive = archiver('zip', {
        zlib: { level: 1 }
      });

      output.on('close', () => {
        console.log(archive.pointer() + ' total bytes');
        console.log('Zip archive created successfully');

        res.download(tmpFileName, 'files.zip', (err) => {
          if (err) {
            console.error('Error sending zip file:', err);
          }

          fs.unlinkSync(tmpFileName);
        });
      });

      archive.pipe(output);

      files.forEach(file => {
        console.log('Original Name:', file.originalName);
        console.log('Path:', file.path);
        archive.file(file.path, { name: file.originalName });
      });

      archive.finalize();
      return;
    }else if (files.length < 1) {
      const error = "couldn't  retrieve files :(";
      res.render('error_msg.ejs', { error })
      return;
    }

    console.log('No files found with the specified URL');
  } catch (err) {
    console.error('Error:', err);
    res.render('download.ejs');
  }
  res.render('download.ejs');
});

app.post('/download', async (req, res) => {
  const link = req.body.link;
  console.log("download:" + link);

  try {
    await client.connect();
    console.log('client connected');

    const db = client.db(dbName);
    const collection = db.collection('files');
    const files = await collection.find({ url: link }).toArray();

    if (files.length === 1) {
      console.log('Original Name:', files[0].originalName);
      console.log('Path:', files[0].path);
      res.download(files[0].path, files[0].originalName);
      return;
    } else if (files.length > 1) {
      const tmpFileName = './public/temp/files.zip';
      const output = fs.createWriteStream(tmpFileName);
      const archive = archiver('zip', {
        zlib: { level: 1 }
      });

      output.on('close', () => {
        console.log(archive.pointer() + ' total bytes');
        console.log('Zip archive created successfully');

        res.download(tmpFileName, 'files.zip', (err) => {
          if (err) {
            console.error('Error sending zip file:', err);
          }

          fs.unlinkSync(tmpFileName);
        });
      });

      archive.pipe(output);

      files.forEach(file => {
        console.log('Original Name:', file.originalName);
        console.log('Path:', file.path);
        archive.file(file.path, { name: file.originalName });
      });

      archive.finalize();
      return;
    }else if (files.length < 1) {
      const error = "couldn't  retrieve files :(";
      res.render('error_msg.ejs', { error })
      return;
    }

    console.log('No files found with the specified URL');
  } catch (err) {
    console.error('Error:', err);
  }

});


app.post('/space', async (req, res) => {
  const tempUser = await getUsrById(req.user.Uid)
  const spacesList = tempUser[0].spaces;
  const space = []
  const foundspace = spacesList.filter(function(dawd) {
    return dawd.Sid === req.body.spaceid
  })
  if(foundspace.length != 0) {
    res.render('space.ejs', {
      space:  foundspace[0],
      user: req.user
    })
  } else {
    console.log(space)
    console.log('bad input');
    res.redirect('/hub')
  }
})
app.post('/user/pfp', async (req, res) => {
  for(let i in users) {
    if(req.user.Uid == users[i].Uid) {
      
      if(fs.existsSync(users[i].pfp)){
        fs.unlinkSync(users[i].pfp)
      }
      users[i].pfp = req.body.newpfp;
    }
  }
  try{
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('users')
    const updatedResult = await collection.updateOne({Uid: req.user.Uid}, {$set: {pfp: req.body.newpfp}})
    console.log(updatedResult)
  } catch (error){
    console.error(error);
  }
  res.redirect('/user')
})


const uplouadPfp = multer({ storage:  multer.diskStorage({
  destination: './public/pfp_img'
}) });

app.post('/user/pfp/upload', uplouadPfp.single('image'), async(req, res)=>{
  console.log("img upload--> post")

  for(let i in users) {
    if(req.user.Uid == users[i].Uid) {
      console.log(users[i].pfp);
      if(fs.existsSync(users[i].pfp)){
        fs.unlinkSync(users[i].pfp)
      }
      users[i].pfp = req.file.path;
      console.log(users[i].pfp);
    }
  }
  try{
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('users')
    const updatedResult = await collection.updateOne({Uid: req.user.Uid}, {$set: {pfp: req.file.path}})
    console.log(updatedResult)
  } catch (error){
    console.error(error);
  }
  res.end();
});



app.post('/user/disc', async (req, res) => {
  for(let i in users) {
    if(req.user.Uid == users[i].Uid) {
      users[i].disc = req.body.disc;
    }
  }
  try{
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('users')
    const updatedResult = await collection.updateOne({Uid: req.user.Uid}, {$set: {disc: req.body.disc}})
    console.log(updatedResult)
  } catch (error){
    console.error(error);
  }
  res.redirect('/user')
})

app.post('/user/tag', async (req, res) => {
  for(let i in users) {
    if(req.user.Uid == users[i].Uid) {
      users[i].tag = req.body.disc;
    }
  }
  try{
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('users')
    const updatedResult = await collection.updateOne({Uid: req.user.Uid}, {$set: {tag: req.body.disc}})
    console.log(updatedResult)
  } catch (error){
    console.error(error);
  }
  res.redirect('/user')
})


app.post('/friend', async (req, res) => {
  const toFid = req.body.Fid
  const tempFri = await getUsrById(toFid)
  res.render('friend.ejs', {
    user: tempFri[0]
  })
})



app.post('/login', passport.authenticate('local', {
  successRedirect: '/hub',
  failureRedirect: '/login',
  failureFlash: true
}));
app.post('/register', async (req, res) => {
  try {
    await client.connect();

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
              const db = client.db(dbName);
              const collection = db.collection('users')
              collection.insertOne({
              Uid: users.length +1,
              name: req.body.name,
              email: req.body.email,
              password: hashpw,
              tag: req.body.name,
              isDev: false,
              pfp:"https://i.ibb.co/m8bCySY/83bc8b88cf6bc4b4e04d153a418cde62.jpg",
              disc:"im a user!",
              spaces: []
              })
              await refreshUser()
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
  
const upload = multer({ storage: multer.diskStorage({
  destination: './public/uploads'
}) })

app.post("/uploads", upload.array("files"),async (req, res) => {

  var shareLink = randomString(30, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  var urlShareLink =`${getDomain()}/share?link=${shareLink}`; //Localhost: req.headers.origin
  await client.connect();
    console.log('client connected');
    const db = client.db(dbName);
    const collection = db.collection('files')

  for(let i =0; i < req.files.length; i++) {
    // db.fileUp(req.files[i].path, req.files[i].originalname, shareLink);
    collection.insertOne({
      path: req.files[i].path,
      originalName: req.files[i].originalname,
      url: shareLink,
      uploadTime: new Date()
    })
    
}
// qr_popup(shareLink)
res.json({ variable: urlShareLink });
    
});



const activeClients = {};

app.get('/transfer', checkIOclients, (req, res) => {
  const link = req.query.link;

  res.render('sendData.ejs', { link })
});

app.get('/request',  (req, res) => {
  const link = randomString(30, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const urlLink =`${getDomain()}/transfer?link=${link}`;

  activeClients[link] = null;

  res.render('receive.ejs', { urlLink: urlLink, link: link  })
});

app.post('/transfer', upload.array("files"), async(req, res) => {
  const link = req.body.link;
  const msg = req.body.msg;
  const files = req.files;
  
  if(activeClients.hasOwnProperty(link) && activeClients[link]){
      await client.connect();
      console.log('client connected');
      const db = client.db(dbName);
      const collection = db.collection('files')

      for(let i =0; i < req.files.length; i++) {
        collection.insertOne({
          path: req.files[i].path,
          originalName: req.files[i].originalname,
          url: link,
          uploadTime: new Date()
        })
    }


      if(msg){
        activeClients[link].emit('stringTransfer', msg);}
      if(files && files.length > 0){
        activeClients[link].emit('downloadTransfer', { link, files });
      }
      activeClients[link].disconnect(true);
  

      console.log('Link:', link);
      console.log('Message:', msg);
      console.log('Files:', files);
  }else{

    for (const file of files) {
      fs.unlink(file.path, (error) => {
        if (error) {
          console.error('Error deleting file:', error);
        } else {
          console.log('File deleted:', file.originalname);
        }
      });
    }

    res.render('error_msg.ejs', { error: 'Client is not connected ):' })
  }

});



io.on('connection', (socket) => {
  console.log("socket connected")
  
  socket.on('sendLink', (linkID) => {
    
    activeClients[linkID] = socket;
    console.log("new socket connected with link", linkID)
  });


  socket.on('disconnect', () => {
    const link = Object.keys(activeClients).find((key) => activeClients[key] === socket);
    if (link) {
      activeClients[link] = null;
      console.log("client", link, "disconnected")
    }
  });

});

function checkIOclients(req, res, next){
  let link = req.query.link;
  if(link === undefined || link === null){
    link = req.body.link;
  }
  console.log(link)
  if (activeClients.hasOwnProperty(link) && activeClients[link]) {
    next();
  } else {
    res.render('error_msg.ejs', { error: 'Client is not connected ):' })
  }
}






function getTime(){
  const now = new Date();
  const hours = now.getHours().toString();
  const minutes = now.getMinutes().toString();
  const seconds = now.getSeconds().toString();

  const currentTime = `${hours}:${minutes}:${seconds}`;
  return currentTime;
}

async function deleteOldFiles() {
  console.log("refresh --> "+getTime())
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('files');

    
    const thirtyMinutesAgo = new Date(Date.now() - 5 * 60* 1000);

    
    const filesToDelete = await collection.find({
      uploadTime: { $lt: thirtyMinutesAgo }
    }).toArray();

    
    for (const file of filesToDelete) {
      fs.unlink(file.path, (error) => {
        if (error) {
          console.error('Error deleting file:', error);
        } else {
          console.log('File deleted:', file.originalname);
        }
      });
    }

   
    await collection.deleteMany({
      uploadTime: { $lt: thirtyMinutesAgo }
    });
  } catch (error) {
    console.error('Error deleting old files:', error);
  }
};

function del (){
  console.log("time -->  sec")
}

setInterval(deleteOldFiles, 1 * 60 * 1000);



function randomString(length, characters) {
  var result = '';
  var charactersLength = characters.length;
  
  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }
  
  return result;
};
function getIP(){
  const networkInterfaces = os.networkInterfaces();
  const localIP = Object.values(networkInterfaces)
    .flat()
    .find(({ family, internal }) => family === 'IPv4' && !internal)?.address || '';
  
 return localIP; 
};

function getDomain(){
  const domain =`http://${getIP()}:${port}`;
  // const domain = 'https://aether.serveo.net';
  return domain;
}

module.exports = {
  randomString,
};


http.listen(port,() => {
  connectDB();
  console.log('Running at Port', port);
  console.log(`server-adress: ${getDomain()}/`);
  
});