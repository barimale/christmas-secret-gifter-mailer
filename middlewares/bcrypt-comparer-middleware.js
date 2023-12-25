const bcrypt = require('bcrypt');

const existingHash = "$2b$10$J02j.QbzLoWQjv5GsfixUOasdasdaddddssssz/O"; //db

const bcryptComparerMiddleware = (req, res, next) => {
  try {
    
  bcrypt.compare(
    req.locals.body['apikey'],
    existingHash,
    (err, ress) => {
        if(ress && ress === true) {        
         req.locals.ress = true;
        
           next();
        }
        else {
          req.locals.ress = false;

            console.log("Invalid Password");
            res.status(400).send('Something went wrong.');
        }
  })
} catch (error) {
  console.log("Invalid data");
  res.status(400).send('Something went wrong.');
}
};

module.exports = bcryptComparerMiddleware;