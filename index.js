const express = require('express');
const path = require('path')
const PORT = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

express().use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

const expressApp = express().use(bodyParser.json());
expressApp.listen(PORT, () => console.log(`Listening on ${ PORT }`));

expressApp.get('/',async function (req, res) {
	res.send("Hello World");
	
});
