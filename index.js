const express = require('express');
const path = require('path')
const PORT = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const AWS = require("aws-sdk");
const bgpoll = require("./bgpolling.js")
const sqsmsging = require("./aws/sqsmessaging.js")

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const AWARDS = "Awards"
const GRID_MON = "GridMonitoring"

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

express().use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

const expressApp = express().use(bodyParser.json());
expressApp.listen(PORT, () => console.log(`Listening on ${ PORT }`));
expressApp.use(bodyParser.urlencoded({
  extended: true
}));

expressApp.get('/',async function (req, res) {
	res.sendFile("index.html", {root:__dirname}) 
  bgpoll.doCallback(bgpoll.getMsgFromQ(sqs, params, queueURL))
});

expressApp.post('/', function (req, res) {
  console.log(req.body)
  var count = req.body.Count
  sqsmsging.sendSQSMessage(sqs, params, queueURL, count)
  res.sendFile("index.html", {root:__dirname})
});

/*AWS1.config.update({
  region: "us-east-1",
});
*/
//'Profield WorkOrderCount 2019-02-06 10'
