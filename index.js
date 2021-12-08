let express = require("express"),
  path = require('path'),
  nodeMailer = require('nodemailer'),
  bodyParser = require('body-parser');

let app = express();
var cors = require('cors')

const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const keyJson =  "{\"type\":\"Buffer\",\"data\":[124,220,206,184,127,124,38,166,182,93,101,77,57,223,219,125,166,33,187,151,77,32,103,199,215,19,248,113,255,232,220,19]}";
const ivJson =  "{\"type\":\"Buffer\",\"data\":[77,177,156,230,70,8,218,20,182,232,146,11,74,126,187,23]}";
const key = JSON.parse(keyJson);
const iv = JSON.parse(ivJson);

const whitelist = ['https://PUTHEREALBERGUE.web.app','https://odkrywajcie.web.app', 'https://odkrywajcie.pl', 'https://profipromo.pl', 'https://utilities-mailer.herokuapp.com']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log(origin);
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const bcrypt = require('bcrypt');

const saltRounds = 10;
const password = "odkrywajcie-mailer-ajdfnhajdfnaf-Password@2020";
const existingHash = "$2b$10$J02j.QbzLoWQjv5GsfixUO0Q9KRoUfRHdehcnNZB1Alvb6QGnhz/O";

app.use(express.static('src'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions))

const albergueTransporter = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
      user: "albergue.porto.it@gmail.com",
      pass: "Albergue2021!"
  },
  tls: {
    rejectUnauthorized: false
  }
});

let transporters = {
  "service_08vey2o" : albergueTransporter
};

let fromService = {
  "service_08vey2o" : 'albergue.porto.it@gmail.com'
}

function decrypt(text) {
  let encryptedText = Buffer.from(text, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv));
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
 }


app.post('/send-email', function (req, res) {
  try {
    console.log(req.body.data);
    let decrypted = decrypt(req.body.data);
    console.log(decrypted);

    const asParams = new URLSearchParams(decrypted);

    var body = []; 

    for(var pair of asParams.entries()) {
      body[pair[0]] = pair[1];
    }
        
  if(Object.keys(fromService).findIndex(p => p === body['serviceid']) < 0)
  {
    console.log("Invalid serviceId");
    res.status(400).send('Something went wrong.');
    return;
  }
  if(Object.keys(transporters).findIndex(p => p === body['serviceid']) > -1)
  {
  bcrypt.compare(
    body['apikey'],
    existingHash,
    (err, ress) => {
        if(ress && ress === true) {        
          let mailOptions = {
            from: fromService[body['serviceid']],
            to: body['to'],
            subject: body['subject'],
            html: body['message']
          };

          transporters[body['serviceid']].sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(400).send('Something went wrong.');
            }
            else
            {
              console.log('Message ' +info.messageId +  'sent: ' + info.response);
              res.status(200).send('Message ' +info.messageId +  'sent: ' + info.response);
            }
          });
        }
        else {
            console.log("Invalid Password");
            res.status(400).send('Something went wrong.');
        }
  })}
  else
  {
    console.log("Invalid Password");
    res.status(400).send('Something went wrong.');
  }
} catch (error) {
  console.log("Invalid data");
  res.status(400).send('Something went wrong.');
}
});

let server = app.listen(process.env.PORT || 4000, function(){
    let port = server.address().port;
    // let host = server.address().host;
    // console.log("Server started at ", (host || process.env.HOST || 'http://localhost') + ":" + port);

    Object.keys(transporters).forEach((serviceId) => {
      transporters[serviceId].verify(function(error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log(serviceId + " is ready to take our messages");
        }
      });
    });
    
});