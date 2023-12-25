const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const keyJson =  "{\"type\":\"Buffer\",\"data\":[124,220,19]}"; //db
const ivJson =  "{\"type\":\"Buffer\",\"data\":[77,177,156,230,70]}"; //db
const key = JSON.parse(keyJson);
const iv = JSON.parse(ivJson);

function decrypt(text) {
  let encryptedText = Buffer.from(text, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv));
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
 }

 const decryptMiddleware = (req, res, next) => {
  try {
    console.log(req.body.data);
    let decrypted = decrypt(req.body.data);
    console.log(decrypted);

    const asParams = new URLSearchParams(decrypted);

    var body = []; 

    for(var pair of asParams.entries()) {
      body[pair[0]] = pair[1];
    }

    req.locals.body = body;

    next();
  } catch (error) {
    console.log("Invalid data");
    res.status(400).send('Something went wrong.');
    return;
  }
};

module.exports = decryptMiddleware;