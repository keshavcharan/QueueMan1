const dyndb = require("./aws/dyndb.js");

function getMsgFromQ(sqs, params, queueURL) {
  console.log("Polling for message")
  sqs.receiveMessage(params, function(err, data) {
    if (err) {
      console.log("Receive Error", err);
    } else if (data.Messages) {
      console.log("Have Message", data.Messages[0])
      var deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      };
      updateToDynamoDb(data.Messages[0].Body)
      sqs.deleteMessage(deleteParams, function(err, data) {
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
  setTimeout(getMsgFromQ, 1000, sqs, params, queueURL);
}

function doCallback(callback) {
    callback
}

exports.doCallback = doCallback
exports.getMsgFromQ = getMsgFromQ