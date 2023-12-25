
const transporters = require('../utils/transporters');
const fromService = require('../utils/transporters');

const mailSenderMiddleware = (req, res, next) => {
  try {

    if(req.locals.ress === true) {        
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
      next();
    }
    else {
        console.log("Invalid Password");
        res.status(400).send('Something went wrong.');
    }
} catch (error) {
  console.log("Invalid data");
  res.status(400).send('Something went wrong.');
}
};

module.exports = mailSenderMiddleware;