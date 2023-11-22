if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  const express = require("express")
  const cors = require("cors")
  const mongoose = require('mongoose')
  const userRoute = require("./Routes/userRoute")
  const app = express()
  
  const port = process.env.PORT || 2020;
  const uri = process.env.DBURI;
  
  //db
  mongoose.connect(uri, {
    
  }).then(() => {
    console.log('mongoDB connected!')
  }).catch((error) => {
    console.error(error.message);
  })
  
  app.use(express.json())
  app.use(cors())
  app.use("/api/users", userRoute);
  
  app.listen(port, (req, res) => {
      console.log(`server is running on: ${port}`);
  })
  
  //paths
  app.get('/', (req, res) => {
    res.send(":|")
  })
  