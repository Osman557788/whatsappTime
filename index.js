const User = require('./models/instance');

User.findAll().then(users => {
    console.log(users);
});