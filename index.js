let express = require("express");
const app = express();

// middlewares
let decryptMiddleware = require('./middlewares/decrypt-middleware');
app.use(decryptMiddleware);
let serviceMiddleware = require('./middlewares/service-middleware');
app.use(serviceMiddleware);
let bcryptComparerMiddleware = require('./middlewares/bcrypt-comparer-middleware');
app.use(bcryptComparerMiddleware);
let mailSenderMiddleware = require('./middlewares/mail-sender-middleware');
app.use(mailSenderMiddleware);

// configuration
// // cors
const cors = require('cors')
const corsOptions = require('./utils/whiteList')
app.use(cors(corsOptions));
app.options('*', cors(corsOptions))

// // limiter
const limiter = require('./utils/rateLimit')
app.use(limiter)

// third parties
let bodyParser = require('body-parser');
app.use(express.static('src'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// transporters
const transporters = require("./utils/transporters");

// API
app.post('/send-email', function (req, res) {
  try {
    console.log(req.body.data);
} catch (error) {
  console.log("Invalid data");
  res.status(400).send('Something went wrong.');
}
});

let server = app.listen(process.env.PORT || 4000, function(){
    let port = server.address().port;
    let host = server.address().host;
    console.log("Server started at ", (host || process.env.HOST || 'http://localhost') + ":" + port);

    Object.keys(transporters.transporters).forEach((serviceId) => {
      const result = transporters.verifyTransporter(serviceId);
        console.log(serviceId + " is successfully verified: " + result);
      });
});