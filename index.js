exports.handler = (event, context, callback) => {
    const AWS = require('aws-sdk');
    //AWS.config.region = 'eu-central-1';
    const route53 = new AWS.Route53();

    // Keep passwords etc out of the code...
    const user = process.env.USERNAME;
    const pass = process.env.PASSWORD;
    const zoneID = process.env.ZONEID;
    const host = process.env.HOSTNAME;

    // prepare response
    let responseCode = 200;   
    let returnResponse = (responseCode, responseBody) => {
        // The output from a Lambda proxy integration must be of the following JSON object. The 'headers' property 
        // is for custom response headers in addition to standard ones. The 'body' property must be a JSON string. 
        // For base64-encoded payload, you must also set the 'isBase64Encoded' property to 'true'.
        let response = {
            statusCode: responseCode,
            headers: {
                "x-custom-header" : "nothingtoseehere"
            },
            body: JSON.stringify(responseBody)
        };
        console.log("response: " + JSON.stringify(response))
        callback(null, response);
    }
    
    console.log("request: " + JSON.stringify(event));
    const params = event.queryStringParameters;
    if (!params) {
        returnResponse(400, 'missing params');
        return;
    }    
    console.log(params);
   
    const ipaddr = params.ipaddr;
    const givenuser = params.username;
    const givenpass = params.password;
    if (!ipaddr || !givenuser || !givenpass) {
        returnResponse(400, 'missing params');
        return;
    }    
    if (givenuser !== user || givenpass !== pass) {
        returnResponse(403, 'Access denied');
        return;
    }
    
    var responseBody = 'setting ip address ' + ipaddr + ' on behalf of ' + user;
    
    var r53params = {
      ChangeBatch: { 
        Changes: [ 
          {
            Action: 'UPSERT', 
            ResourceRecordSet: { 
              Name: host, 
              Type: 'A',
              TTL: 300,
              ResourceRecords: [
                {
                  Value: ipaddr
                }
              ]
            }
          }
        ],
        Comment: 'autoupdate'
      },
      HostedZoneId: zoneID
    };
    console.log(r53params);
    
    route53.changeResourceRecordSets(r53params, function(err, data) {
      if (err) {
          console.log(err, err.stack); // an error occurred
          responseCode = 500;
          responseBody = err;
      } 
      else {
          console.log(data);           // successful response
      } 
    });

    returnResponse(responseCode, responseBody);
};
