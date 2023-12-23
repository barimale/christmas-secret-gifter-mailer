let express = require("express"),
  nodeMailer = require('nodemailer'),
  bodyParser = require('body-parser');

let app = express();
var cors = require('cors')

const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const keyJson =  "{\"type\":\"Buffer\",\"data\":[124]}";
const ivJson =  "{\"type\":\"Buffer\",\"data\":[77,177]}";
const key = JSON.parse(keyJson);
const iv = JSON.parse(ivJson);

const whitelist = ['https://mailer_URL.domain.net','http://localhost:3010','http://localhost']
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
const existingHash = "existing_Hash_HERE_calculated_by_using_values_from_above";

app.use(express.static('src'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.options('*', cors(corsOptions))

const albergueTransporter = nodeMailer.createTransport({
  host: 'smtp.domain.com',
  port: 222,
  secure: true,
  auth: {
      user: "my_email@domain.com",
      pass: "password"
  },
  tls: {
    rejectUnauthorized: false
  }
});

let transporters = {
  "serviceID_HERE" : albergueTransporter
};

let fromService = {
  "serviceID_HERE" : 'my_email@domain.com'
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
    let host = server.address().host;
    console.log("Server started at ", (host || process.env.HOST || 'http://localhost') + ":" + port);

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