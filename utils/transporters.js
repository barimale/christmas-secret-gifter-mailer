const nodeMailer = require('nodemailer');

const albergueTransporter = nodeMailer.createTransport({
    host: 'smtp.mail.com',
    port: 405,
    secure: true,
    auth: {
        user: "user@domain.com",
        pass: "password"
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
const transporters = {
  "service_08vey2o" : albergueTransporter
};

const fromService = {
  "service_08vey2o" : 'user@domain.com'
}

function verifyTransporter(serviceId)
{
  const transporter= transporters[serviceId];
  console.log(serviceId);
  transporter.verify(function(error, success) {
    if (error) {
      console.log(error);
      return false;
    } else {
      console.log(serviceId + " is ready to take messages");
      return true;
    }
  });

  return false;
}

module.exports = { transporters, fromService, verifyTransporter }