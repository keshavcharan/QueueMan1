const express = require('express');
const path = require('path')
const PORT = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const AWS = require("aws-sdk");
const AWS1 = require("aws-sdk");
const bgpoll = require("./bgpolling.js")

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const sqs1 = new AWS1.SQS({apiVersion: '2012-11-05'});

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
	//res.send("Hello World");
	res.sendFile("index.html", {root:__dirname})
  var getmsg = bgpoll.getMsgFromQ(sqs1, params, queueURL)
  bgpoll.doCallback(getmsg)
});

expressApp.post('/', function (req, res) {
  console.log("Test");
  console.log(req.body);
  var count = req.body.Count
  var params = {
   DelaySeconds: 10,
   MessageBody: `Profield WorkOrderCount 2019-02-13 ${count}`,
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

//'Profield WorkOrderCount 2019-02-06 10'
