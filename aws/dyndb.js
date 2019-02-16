const AWS = require("aws-sdk");
const PROFIELD_TABLE = "Profield"
const DYNAMO_DB = new AWS.DynamoDB();
const DYNAMO_DB_DOCUMENT = new AWS.DynamoDB.DocumentClient();

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

exports.updateToDynamoDb = async function (messageBody) {
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