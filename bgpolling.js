const dyndb = require("./aws/dyndb.js");

exports.doCallback = function(callback) {
    callback
}

exports.getMsgFromQ = function (sqs, params, queueURL) {
	callMsgFromQ(sqs, params, queueURL)
}

function callMsgFromQ(sqs, params, queueURL) {
  console.log("Polling for message ", Date.now())
  sqs.receiveMessage(params, function(err, data) {
    if (err) {
      console.log("Receive Error", err);
    } else if (data.Messages) {
      console.log("Have Message", data.Messages[0])
      var deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      };
      dyndb.updateToDynamoDb(data.Messages[0].Body)
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
  setTimeout(callMsgFromQ(sqs, params, queueURL), 1000);
}
