const express = require('express');
const path = require('path')
const PORT = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const AWS = require("aws-sdk");
const AWS1 = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const sqs1 = new AWS1.SQS({apiVersion: '2012-11-05'});

const DYNAMO_DB = new AWS.DynamoDB();
const DYNAMO_DB_DOCUMENT = new AWS.DynamoDB.DocumentClient();

const PROFIELD_TABLE = "Profield"
const AWARDS = "Awards"
const GRID_MON = "GridMonitoring"

express().use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

const expressApp = express().use(bodyParser.json());
expressApp.listen(PORT, () => console.log(`Listening on ${ PORT }`));
expressApp.use(bodyParser.urlencoded({
  extended: true
}));

expressApp.get('/',async function (req, res) {
	//res.send("Hello World");
	res.sendFile("index.html", {root:__dirname})
  doCallback(getMsgFromQ)
});

expressApp.post('/', function (req, res) {
  console.log("Test");
  console.log(req.body);
  var count = req.body.Count
  var params = {
   DelaySeconds: 10,
   MessageBody: `Profield WorkOrderCount 2019-02-07 ${count}`,
   QueueUrl: queueURL
  };

  sqs.sendMessage(params, function(err, data, count) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.MessageId);
    }
  });
  res.sendFile("index.html", {root:__dirname})

});

AWS1.config.update({
  region: "us-east-1",
});

var queueURL = "https://sqs.us-east-1.amazonaws.com/755410653970/dataqueue";


var params = {
 MaxNumberOfMessages: 1,
 MessageAttributeNames: [
    "All"
 ],
 QueueUrl: queueURL,
 VisibilityTimeout: 20,
 WaitTimeSeconds: 0
};

function getMsgFromQ() {
  console.log("Polling for message")
  sqs1.receiveMessage(params, function(err, data) {
    if (err) {
      console.log("Receive Error", err);
    } else if (data.Messages) {
      console.log("Have Message", data.Messages[0])
      var deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      };
      updateToDynamoDb(data.Messages[0].Body)
      sqs1.deleteMessage(deleteParams, function(err, data) {
        if (err) {
          console.log("Delete Error", err);
        } else {
          console.log("Message Deleted", data);
        }
      });
    } else {
      console.log("No Messages Found")
    }
  }); 
  setTimeout(getMsgFromQ, 1000);
}

var doCallback = function(callback) {
    callback();
}

//'Profield WorkOrderCount 2019-02-06 10'
async function updateToDynamoDb(messageBody) {
  messageBody = messageBody.split(" ");

  var responseObj;
  var date_wo = messageBody[2];
  var count = messageBody[3];
  console.log(`${date_wo}`);
  var params = {
      TableName: PROFIELD_TABLE,
      KeyConditionExpression: "#wo_date = :woid",
      ExpressionAttributeNames:{
          "#wo_date": "Date"
      },
      ExpressionAttributeValues: {
          ":woid": date_wo
      }
  };

  var replymsg = await DYNAMO_DB_DOCUMENT.query(params).promise();
  var wos = replymsg.Items[0].workorders;
  wos = parseInt(wos) + parseInt(count)
  console.log(wos);

    var paramsU = {
      TableName: PROFIELD_TABLE,
      Key:{
          "Date": date_wo,
      },
      UpdateExpression: "set workorders = :wo",
      KeyConditionExpression: "#wo_date = :wo",
      ExpressionAttributeValues: {
          ":wo": wos
      },
      ReturnValues:"UPDATED_NEW"
    };
  console.log("Updating the item...");
  replymsg = await DYNAMO_DB_DOCUMENT.update(paramsU).promise();
  console.log(replymsg)
}