const express = require("express");
let router = express.Router()
const passport = require("passport")
const {loginUser, registerUser, doEcho} = require("./tools/cont/userContr")


router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/echo', doEcho)

module.exports = router;