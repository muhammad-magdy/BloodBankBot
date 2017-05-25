/* eslint-disable no-console */
// require('dotenv').config();
const localizify = require('localizify');
var request = require('request');
var events = require('events');
var usersDictionary = require('../Users.js');
var googleMapsClientService = require('../Services/googleMapsClientService');
var bloodbankUserCtrl=require('../Controllers/bloodbankbot.server.controller');

const en = require('./Messages/en.json');
const ar = require('./Messages/ar.json');

const compatiblePlateletsTypes=[
          {
            key: "O+",
            value: ["A+", "A-", "O-", "O+","AB-","AB+"]
          },
          {
            key: "O-",
            value: ["A+", "A-", "O-", "O+","AB-","AB+"]
          },
          {
            key: "B+",
            value: ["A-", "A+","O+","O-", "AB+","AB-","B+","B-"]
          },
          {
            key: "B-",
            value: ["A-", "A+","O+","O-", "AB+","AB-","B+","B-"]
          },
          {
            key: "AB+",
            value: ["A-", "A+","O+","O-", "AB+","AB-","B+","B-"]
          },
          {
            key: "AB-",
            value: ["A-", "A+","O+","O-", "AB+","AB-","B+","B-"]
          },
          {
            key: "A+",
            value: ["A-", "A+","O+","O-", "AB+","AB-","B+","B-"]
          },
          {
            key: "A-",
            value: ["A-", "A+","O+","O-", "AB+","AB-","B+","B-"]
          },
        ];
const compatiblePlasmaTypes=[
          {
            key: "O+",
            value: ["A+", "A-", "O-", "O+","B+","B-","AB-","AB+"]
          },
          {
            key: "O-",
            value: ["A+", "A-", "O-", "O+","B+","B-","AB-","AB+"]
          },
          {
            key: "B+",
            value: ["B+", "B-", "AB-", "AB+"]
          },
          {
            key: "B-",
            value: ["B+", "B-", "AB-", "AB+"]
          },
          {
            key: "AB+",
            value: ["AB-", "AB+"]
          },
          {
            key: "AB-",
            value: ["AB-", "AB+"]
          },
          {
            key: "A+",
            value: ["A-", "A+","AB+","AB-"]
          },
          {
            key: "A-",
            value: ["A-", "A+","AB+","AB-"]
          },
        ];

const compatibleBloodTypes = [
          {
            key: "A+",
            value: ["A+", "A-", "O-", "O+"]
          },
          {
            key: "A-",
            value: ["A-", "O-"]
          },
          {
            key: "B+",
            value: ["B+", "B-", "O-", "O+"]
          },
          {
            key: "B-",
            value: ["B-", "O-"]
          },
          {
            key: "AB+",
            value: ["AB-","AB+","A+","A-","B+","B-","O+", "O-"]
          },
          {
            key: "AB-",
            value: ["AB-", "B-", "A-", "O-"]
          },
          {
            key: "O+",
            value: ["O-", "O+"]
          },
          {
            key: "O-",
            value: ["O-"]
          },
        ];

localizify
  .add('en', en)
  .add('ar', ar)
  .setLocale('en');

const FB_URL = 'https://graph.facebook.com/v2.6/';
var eventEmitter = new events.EventEmitter();
var users=new usersDictionary();

exports.receivedMessage = function (event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));
  var messageIs_echo = message.is_echo;
  var messageText = message.text;
  var messageQuickReply = message.quick_reply;
  var messageAttachments = message.attachments;
  if (messageQuickReply && messageQuickReply.payload) {
    switch (messageQuickReply.payload) {
      case 'Donor':
        bloodbankUserCtrl.getUserLanguage(senderID, function(error, doc){
        var lang="en";
        console.log(doc);
        if (doc && doc.Language != "") {
          lang = doc.Language;
        }
         localizify.setLocale(lang);
          if (users.getUser(senderID) == null) {
          getProfile(senderID, function (err, userInfo) {
            users.addOrUpdateUser(senderID, userInfo, true,false,lang);
          });
        }
        else{
          AddorUpdateUserDict(senderID, true,false);
        }
        sendDonorBloodDonationTypeQeustion(senderID);
        });
        break;
      case 'Patient':
         bloodbankUserCtrl.getUserLanguage(senderID, function(error, doc){
        var lang = "en";
        console.log(doc);
        if (doc && doc!="undefined" && doc.Language != "") {
          lang = doc.Language;
        }
        localizify.setLocale(lang);
        if (users.getUser(senderID) == null) {
          getProfile(senderID, function (err, userInfo) {
            users.addOrUpdateUser(senderID, userInfo, false, false, lang);
          });
        }
        else {
            AddorUpdateUserDict(senderID, false, false);
          }
        sendPatientBloodDonationTypeQeustion(senderID);
        });
        break;
      case 'ar':
        localizify.setLocale('ar');
        bloodbankUserCtrl.updateUserLanguage(senderID, "ar", function (err) {
          if (err)
            console.log("can not update : "+ err);
          else {
            AddorUpdateUserDict(senderID, null, null, 'ar');
            sendUserTypeQeustionMessage(senderID);
          }
        });
        break;
      case 'en':
        localizify.setLocale('en');
        bloodbankUserCtrl.updateUserLanguage(senderID, "en", function (err) {
          if (err)
            console.log("can not update: :"+ err);
          else {
            AddorUpdateUserDict(senderID, null, null, 'en');
            sendUserTypeQeustionMessage(senderID);
          }
        });
        break;
      case 'Blood':
      case 'Plasma':
      case 'Platelets':
      case 'All':
        AddorUpdateUserDict(senderID, null, null, null,messageQuickReply.payload);
        sendBloodTypeQeustion(senderID);
        break;
      case 'A+':
      case 'A-':
      case 'B+':
      case 'B-':
      case 'AB+':
      case 'AB-':
      case 'O+':
      case 'O-':
        AddorUpdateUserDict(senderID, null, null, null, null, messageQuickReply.payload);
        sendLocation(senderID);
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '10':
        AddorUpdateUserDict(senderID, null, null, null, null, null, null, null, messageQuickReply.payload);
        sendTextMessage(senderID, localizify.t('phoneNumber'));
        break;
      default:
        handleOtherRecievedMessage(senderID);
    }
  }
  else if (messageAttachments) {
    messageAttachments.forEach(function (attachment) {
      if (attachment.type == "location") {
        var coordinates = attachment.payload.coordinates;
        googleMapsClientService.getUserAddress(coordinates.lat, coordinates.long, function (err,body) {
          var location = {
            address: (body.results[0]!=undefined)?body.results[0].formatted_address:"",
            lat: coordinates.lat,
            long: coordinates.long
          };
          AddorUpdateUserDict(senderID, null, null, null, null, null, location,null,null);
          var user=users.getUser(senderID);
          if (user.isDonor) {
            bloodbankUserCtrl.updateDonor(user);
            sendTextMessage(senderID, localizify.t('donorSaveMsg',{name:user.userInfo.first_name}));
          }
          else {
            sendNumberOfDonorsNeededQeustion(senderID);
          }
        });
      }
      else if(attachment.type == "image"){
        console.log("Image Recived");
      }
    });
  }
  else if (messageText) {
    if (!messageIs_echo) {
      var user = users.getUser(senderID);
      if (user && user.isWaitingforPhoneNumberResponse) {
        eventEmitter.emit('PhoneNumberMessageEvent', messageText, senderID);
      }
      else {
        handleOtherRecievedMessage(senderID);
      }
    }
    else {
      if(messageText ==localizify.t('PatientSaveMsg') ){
        user = users.getUser(recipientID);
        var userName=user.userInfo.first_name+ " "+ user.userInfo.last_name;
        var matchedBloodTypes = getMatchedBloodTypes(user.donationType, user.bloodType);
        bloodbankUserCtrl.getMatchedBloodDonors(recipientID,matchedBloodTypes,user.location,user.donationType,function(err,docs){
          if(err)
          console.log(err);
          if (docs) {
            docs.forEach(function (doc) {
              sendBloodRequestMessage(doc._id, doc.Language, user.phoneNumber, userName);
            });
          }
        });
        bloodbankUserCtrl.getUserLanguage(recipientID, function (err, doc) {
          if (doc && doc.Language != "") {
            localizify.setLocale(doc.Language);
          }
        });
        sendImageMessage(recipientID,'https://raw.githubusercontent.com/muhammad-magdy/BloodBankBot/master/images/SearchingBloodDonors.png');
      }
     else if (messageText == localizify.t('phoneNumber')) {
        AddorUpdateUserDict(recipientID, null, true);
        var handlePhoneNumberMessageEvent = function (message, senderID) {
          if (isPhoneNumberCorrect(message)) {
            AddorUpdateUserDict(senderID, null, false, null, null, null, null,message,null);
            eventEmitter.removeListener('PhoneNumberMessageEvent', handlePhoneNumberMessageEvent);
            var user=users.getUser(senderID);
            bloodbankUserCtrl.updateRequests(user);
            sendTextMessage(senderID, localizify.t('PatientSaveMsg'));
          }
          else {
            // var lang = users.getUserLanguage(senderID);
            sendTextMessage(senderID, localizify.t('invalidPhoneNumber'));
          }
        };
        eventEmitter.on('PhoneNumberMessageEvent', handlePhoneNumberMessageEvent);
      }
    }
  }
}

exports.receivedPostback = function (event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var postback = event.postback;

  console.log("Received postback for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(postback));

  var postbackPayload = postback.payload;
  if (postbackPayload) {
    switch (postbackPayload) {
      case 'BOT_GET_STARTED':
        getProfile(senderID, function (err, userInfo) {
          var userData = {
            first_name: userInfo.first_name,
            last_name: userInfo.last_name,
            locale: userInfo.locale,
            timezone: userInfo.timezone,
            gender: userInfo.gender
          };
          bloodbankUserCtrl.isUserExist(senderID, function (err, result) {
            if(err)console.log(err);
            console.log(result);
            if (!err && result == null) {
              bloodbankUserCtrl.create(senderID, userData, function (err) {
                if(err)console.log(err);
                if(!err)
                  sendGreetingQuestion(senderID, userData);
              });
            }
            else{
              sendGreetingQuestion(senderID, userData);
            }
          });
        });
        break;
      case 'Donor':
        // AddorUpdateUserDict(senderID, true, null);
        bloodbankUserCtrl.getUserLanguage(senderID, function(error, doc){
        var lang="en";
        console.log(doc);
        if (doc && doc.Language != "") {
          lang = doc.Language;
        }
         localizify.setLocale(lang);
          if (users.getUser(senderID) == null) {
          getProfile(senderID, function (err, userInfo) {
            users.addOrUpdateUser(senderID, userInfo, true,false,lang);
          });
        }
        else{
          AddorUpdateUserDict(senderID, true,false);
        }
        sendDonorBloodDonationTypeQeustion(senderID);
        });
        break;
      case 'Patient':
        // AddorUpdateUserDict(senderID, false, null);
        bloodbankUserCtrl.getUserLanguage(senderID, function(error, doc){
        var lang = "en";
        console.log(doc);
        if (doc && doc!="undefined" && doc.Language != "") {
          lang = doc.Language;
        }
        localizify.setLocale(lang);
        if (users.getUser(senderID) == null) {
          getProfile(senderID, function (err, userInfo) {
            users.addOrUpdateUser(senderID, userInfo, false, false, lang);
          });
        }
        else {
            AddorUpdateUserDict(senderID, false, false);
          }
        sendPatientBloodDonationTypeQeustion(senderID);
        });
        break;
      case 'Lang':
        sendLanguageQuestion(senderID);
        break;
      default:
        // handleOtherRecievedMessage(senderID);
        break;
    }
  }
}

exports.setBotConfiguration = function () {
  setGetstartedButton();
  setGreetingMsg();
  setPersistent_menu();
}


function isPhoneNumberCorrect(PhoneNumber) {
  var pattern = new RegExp("^01[0-9]{9}$");
  // var pattern = new RegExp("^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$")
  return pattern.test(PhoneNumber);
}

function sendLocation(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "text": localizify.t('location'),
      "quick_replies": [
        {
          "content_type": "location",
        }
      ]
    }
  };
  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}


function sendBloodRequestMessage(recipientId, language, phoneNumber, userName) {
  localizify.setLocale(language);
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: localizify.t("bloodRequest"),
              subtitle: localizify.t("bloodRequestDetails", { name: userName}),
              item_url: "",
              image_url: "https://raw.githubusercontent.com/muhammad-magdy/BloodBankBot/master/images/ShareTheGift.png",
               buttons: [
              {
                type:"phone_number",
                title:localizify.t("call"),
                payload:phoneNumber
              }]
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

function sendImageMessage(recipientId, imageUrl) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {

      "attachment": {
        "type": "image",
        "payload": {
          "url": imageUrl
        }
      }
    }
  };
  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;
      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(error);
    }
  });
}

function AddorUpdateUserDict(userId, isDonor, isWaitingforPhoneNumberMsg,language, donationType, bloodType, location, phoneNumber, donorsNumber) {
    users.addOrUpdateUser(userId,null, isDonor, isWaitingforPhoneNumberMsg,language, donationType, bloodType, location, phoneNumber, donorsNumber);
}



function sendUserTypeQeustionMessage(recipientId) {
  users.addOrUpdateUser(recipientId, null, false, false);
    var textMsg = localizify.t('userTypeQuestion');
    var messageData = {
      recipient: { id: recipientId },
      message: {
        text: textMsg,
        quick_replies: [
          {
            "content_type": "text",
            "title":localizify.t('donor') ,
            "payload": "Donor"
          },
          {
            "content_type": "text",
            "title": localizify.t('patient'),
            "payload": "Patient"
          }
        ]
      }
    };
    callSendAPI(messageData);
}

function sendLanguageQuestion(userId) {
  getProfile(userId, function (err, userInfo) {
    bloodbankUserCtrl.getUserLanguage(userId, function(error,doc){
      if(error)
        console.log(error);
      var lang = "en";
      console.log(doc);
    if (doc && doc.Language != "") {
      lang = doc.Language;
    }
    else {
      if (userInfo.locale == "ar_AR") {
        lang = 'ar';
      }
    }
    localizify.setLocale(lang);
    users.addOrUpdateUser(userId, userInfo, false, false);
    var messageData = {
      recipient: { id: userId },
      message: {
        text: localizify.t('changeLanguage'),
        quick_replies: [
          {
            "content_type": "text",
            "title": "English",
            "payload": "en"
          },
          {
            "content_type": "text",
            "title": "العربيه",
            "payload": "ar"
          }
        ]
      }
    };
    callSendAPI(messageData);
    });
  });
}

function sendGreetingQuestion(userId, userData) {
  bloodbankUserCtrl.getUserLanguage(userId, function (error, doc) {
    var lang = "en";
    if (!error && doc && doc.Language != "") {
      lang = doc.Language;
    }
    else {
      if (userData.locale == "ar_AR") {
        lang = 'ar';
      }
    }
    localizify.setLocale(lang);
    users.addOrUpdateUser(userId, userData, false, false);
    var messageData = {
      recipient: { id: userId },
      message: {
        text: localizify.t('greeting', { name: userData.first_name }),
        quick_replies: [
          {
            "content_type": "text",
            "title": "English",
            "payload": "en"
          },
          {
            "content_type": "text",
            "title": "العربيه",
            "payload": "ar"
          }
        ]
      }
    };
    callSendAPI(messageData);
  });
}




function handleOtherRecievedMessage(recipientId) {
   bloodbankUserCtrl.getUserLanguage(recipientId, function(error,doc){
      if(error)
        console.log(error);
      var lang = "en";
      console.log(doc);
    if (doc && doc.Language != "") {
      lang = doc.Language;
    }
    localizify.setLocale(lang);
    var messageData = {
      recipient: { id: recipientId },
      message: {
        text: localizify.t('unknown'),
        quick_replies: [
          {
            "content_type": "text",
            "title": localizify.t('donor'),
            "payload": "Donor"
          },
          {
            "content_type": "text",
            "title": localizify.t('patient'),
            "payload": "Patient"
          }
        ]
      }
    };
  callSendAPI(messageData);
   });
}

function sendPatientBloodDonationTypeQeustion(recipientId) {
  var messageData = {
      recipient: { id: recipientId },
      message: {
        text: localizify.t('patientBloodDonationType'),
        quick_replies: [
          {
            "content_type": "text",
            "title": localizify.t('blood'),
            "payload": "Blood"
          },
           {
            "content_type": "text",
            "title": localizify.t('Plasma'),
            "payload": "Plasma"
          },
          {
            "content_type": "text",
            "title": localizify.t('platelets'),
            "payload": "Platelets"
          }
        ]
      }
    };

  callSendAPI(messageData);
}

function sendDonorBloodDonationTypeQeustion(recipientId) {
  var messageData = {
      recipient: { id: recipientId },
      message: {
        text: localizify.t('donorBloodDonationType'),
        quick_replies: [
          {
            "content_type": "text",
            "title": localizify.t('blood'),
            "payload": "Blood"
          },
          {
            "content_type": "text",
            "title": localizify.t('Plasma'),
            "payload": "Plasma"
          },
            {
            "content_type": "text",
            "title": localizify.t('platelets'),
            "payload": "Platelets"
          },
          {
            "content_type": "text",
            "title": localizify.t('all'),
            "payload": "All"
          }
        ]
      }
    };
  callSendAPI(messageData);
}

function sendBloodTypeQeustion(recipientId) {
  var messageData = {
    recipient: { id: recipientId },
    message: {
      text: localizify.t('bloodType'),
      quick_replies: [
        {
          "content_type": "text",
          "title": "O+",
          "payload": "O+"
        },
        {
          "content_type": "text",
          "title": "A+",
          "payload": "A+"
        },
        {
          "content_type": "text",
          "title": "B+",
          "payload": "B+"
        },
        {
          "content_type": "text",
          "title": "AB+",
          "payload": "AB+"
        },
        {
          "content_type": "text",
          "title": "O-",
          "payload": "O-"
        },
        {
          "content_type": "text",
          "title": "A-",
          "payload": "A-"
        },
        {
          "content_type": "text",
          "title": "B-",
          "payload": "B-"
        },
        {
          "content_type": "text",
          "title": "AB-",
          "payload": "AB-"
        }
      ]
    }
  };
  callSendAPI(messageData);
}

function sendNumberOfDonorsNeededQeustion(recipientId) {
  var messageData = {
    recipient: { id: recipientId },
    message: {
      text: localizify.t('donorsNumber'),
      quick_replies: [
        {
          "content_type": "text",
          "title": "1",
          "payload": "1"
        },
        {
          "content_type": "text",
          "title": "2",
          "payload": "2"
        },
        {
          "content_type": "text",
          "title": "3",
          "payload": "3"
        },
        {
          "content_type": "text",
          "title": "4",
          "payload": "4"
        },
        {
          "content_type": "text",
          "title": "5",
          "payload": "5"
        },
        {
          "content_type": "text",
          "title": "6",
          "payload": "6"
        },
        {
          "content_type": "text",
          "title": "7",
          "payload": "7"
        },
        {
          "content_type": "text",
          "title": "8",
          "payload": "8"
        },
        {
          "content_type": "text",
          "title": "9",
          "payload": "9"
        },
        {
          "content_type": "text",
          "title": "10",
          "payload": "10"
        }
      ]
    }
  };
  callSendAPI(messageData);
}

function getProfile(userId, callback) {
  const USER_URL = `${FB_URL}${userId}`;
  request.get(
    {
      url: USER_URL,
      qs: {
        fields: 'first_name,last_name,profile_pic,locale,timezone,gender',
        access_token: process.env.PAGE_ACCESS_TOKEN
      },
      json: true

    }, (err, res, body) => {
      if (callback) {
        callback(err, body);
      }
    });
}

function setPersistent_menu() {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      "persistent_menu": [
        {
          "locale": "default",
          "composer_input_disabled": false,
          "call_to_actions": [
            {
              "title": "I am a Donor",
              "type": "postback",
              "payload": "Donor"
            },
            {
              "title": "Need Blood",
              "type": "postback",
              "payload": "Patient"
            },
            {
              "title": "Change language",
              "type": "postback",
              "payload": "Lang"
            }
          ]
        },
        {
          "locale": "ar_AR",
          "composer_input_disabled": true,
          "call_to_actions": [
            {
              "title": "انا متبرع",
              "type": "postback",
              "payload": "Donor"
            },
            {
              "title": "محتاج دم",
              "type": "postback",
              "payload": "Patient"
            },
            {
              "title": "تغير اللغه",
              "type": "postback",
              "payload": "Lang"
            }
          ]
        }
      ]
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    console.log(body);
  });
}

function setGetstartedButton() {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      "get_started": { "payload": "BOT_GET_STARTED" }
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    console.log(body);
  });
}

function setGreetingMsg() {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      "greeting": [
        {
          "locale": "default",
          "text": "{{user_first_name}},\nwelcome! I'm Blood Bank Bot and I will help you to find people who need blood donation and the people who could give blood"
        }, {
          "locale": "ar_AR",
          "text": "{{user_first_name}},\n مرحبا بك!أنا برنامج بنك الدم و سوف اساعدك علي إيجاد الحالات التي في حاجه شديده للتبرع بالدم أو الاشخاص الذي بامكانهم التبرع بالدم"
        }
      ]
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    console.log(body);
  });
}

/* eslint-disable */
function deleteBotGetstartedConfiguration() {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'DELETE',
    json: {
      "fields": ["persistent_menu",
        "get_started",
        "greeting"
      ]
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    console.log(body);
  });
}
/* eslint-enable */


function getMatchedBloodTypes(donationType, bloodType) {
  switch (donationType) {
    case 'Platelets':
      return compatiblePlateletsTypes.find(x => x.key === bloodType).value;
    case 'Plasma':
      return compatiblePlasmaTypes.find(x => x.key === bloodType).value;
    default:
      return compatibleBloodTypes.find(x => x.key === bloodType).value;
  }
}



