const transporters = require('../utils/transporters');
const fromService = require('../utils/transporters');

const serviceMiddleware = (req, res, next) => {
  var body = req.app.locals.body;
        
  if(Object.keys(fromService).findIndex(p => p === body['serviceid']) < 0)
  {
    console.log("Invalid serviceId");
    res.status(400).send('Something went wrong.');
    return;
  }

  if(Object.keys(transporters).findIndex(p => p === body['serviceid']) <= -1)
  {
    console.log("Invalid transporterId");
    res.status(400).send('Something went wrong.');
    return;
  }

  next();
};

module.exports = serviceMiddleware;