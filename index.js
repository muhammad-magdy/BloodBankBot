/* eslint-disable no-console */
require('dotenv').config();
var express = require('express');
var path = require('path');
nunjucks = require( 'nunjucks' );
var bodyParser = require('body-parser');
var bloodBankBot = require('./Bot/bloodBankBot');
const dbOptions = {  
  useNewUrlParser: true,
  useUnifiedTopology: true,
  keepAlive: true, 
  poolSize: 10,
};
var mongoose=require('mongoose');
mongoose.Promise = global.Promise

const dbConnect = function () {
  mongoose.connect(process.env.DB_ConnectionString, dbOptions,
    function (error) {
      if (error)
        console.log(error);
      else {
        console.log("Connected");
      }
    });
}
dbConnect();

mongoose.connection.on('disconnected', () => {
        setTimeout(dbConnect, 5000);
    });
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.engine('html',nunjucks.render);

nunjucks.configure('views', {
  autoescape: true,
  express: app
});
app.set('views', './views');
app.set('view engine','html');
app.use(express.static(path.join(__dirname, 'public')));
app.listen((process.env.PORT || 3000));


app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('/botConfig', function (req, res) {
  bloodBankBot.setBotConfiguration();
});

app.get('/privacy', function (req, res) {
  res.render('privacypolicy.html');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Invalid verify token');
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;
  // Iterate over each entry - there may be multiple if batched
  data.entry.forEach(function (entry) {
    // Iterate over each messaging event
    entry.messaging.forEach(function (event) {
      if (event.message) {
        bloodBankBot.receivedMessage(event);
      }
      else if (event.postback) {
        bloodBankBot.receivedPostback(event);
      }
      else {
        console.log("Webhook received unknown event: ", event); // eslint-disable-line no-console
      }
    });
  });
  // Assume all went well.
  // You must send back a 200, within 20 seconds, to let us know
  // you've successfully received the callback. Otherwise, the request
  // will time out and we will keep trying to resend.
  res.sendStatus(200);
});
