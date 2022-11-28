var aws = require('aws-sdk');
var dynamo = new aws.DynamoDB();

var tableName = "lambynamo-counter-table";

exports.handler = async (event) => {
    console.info(JSON.stringify(event))

    var counterName = event.queryStringParameters.name + "";
    if(!counterName || counterName.length > 255) {
        return {
            statusCode: 400,
            body: "invalid name. " + counterName,
        };
    }
    var sourceIpAddress = event.requestContext.http.sourceIp;

    var updatedCounter = await count(counterName, sourceIpAddress);
    
    return {
        statusCode: 200,
        body: JSON.stringify(updatedCounter),
    };
};

function count(counterName, sourceIpAddress) {
    return new Promise((resolve, reject) => {
        dynamo.updateItem({
            TableName: tableName,
            ReturnValues: "ALL_NEW",
            Key: {
                CounterName: { S: counterName },
            },
            UpdateExpression: "SET #v1=:v1 ADD #v2 :v2",
            ExpressionAttributeNames: {
                "#v1": "LastIPAddress",
                "#v2": "Current",
            },
            ExpressionAttributeValues: {
                ":v1": { S: sourceIpAddress },
                ":v2": { N: "1" },
            }
        }, function (err, data) {
            if (err) {
                reject(err, err);
            } else {
                resolve(data);
            }
        });
    });
}