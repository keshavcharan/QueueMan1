
function sendSQSMessage(sqs, params, queueURL,count) {
  var params = {
   DelaySeconds: 10,
   MessageBody: `Company WorkOrderCount 2019-02-13 ${count}`,
   QueueUrl: queueURL
  };

  sqs.sendMessage(params, function(err, data, count) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.MessageId);
    }
  });
}

exports.sendSQSMessage = sendSQSMessage