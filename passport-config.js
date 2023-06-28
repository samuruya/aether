const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');


function initialize(passport, getUserbyName, getUserbyId) {
    const authUser = async (name, password, done) => {
        const user = getUserbyName(name)
        if(user == null) {
            return done(null, false, { message:  'there is no user with this name'})
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Password incorrect'})
            }
        } catch (e){
            return done(e)
        }

    }
    passport.use(new LocalStrategy({ usernameField: 'name'}, authUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {  
        done(null, getUserbyId(id))
    })
}

module.exports = initialize