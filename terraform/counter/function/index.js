var aws = require('aws-sdk');
var dynamo = new aws.DynamoDB();

// TODO 環境変数にするなど
var tableName = "lambdynamo-counter-table";

exports.handler = async (event) => {
    console.info(JSON.stringify(event));

    const counterName = event.queryStringParameters?.name;
    if (!counterName || counterName.length > 255) {
        return {
            statusCode: 400,
            body: "invalid name. " + counterName,
        };
    }
    const digit = (event.queryStringParameters?.digit ?? 6) * 1;
    const isIpCheck = !!(event.queryStringParameters?.ip_check ?? false);
    const sourceIpAddress = event.requestContext.http.sourceIp;

    const updatedCounter = await count(counterName, sourceIpAddress, isIpCheck);
    console.info(JSON.stringify(updatedCounter));

    const updatedCount = updatedCounter.Current.N;
    const updatedCountText = (Array(digit).join('0') + updatedCount).slice(-digit);

    // TODO デザインそれっぽくしたい
    return {
        statusCode: 200,
        headers: { "content-type": "image/svg+xml" },
        body: `<svg
    width="${updatedCountText.length * 8 + 2}" height="18" xmlns="http://www.w3.org/2000/svg" 
    style="background: rgba(0, 0, 0, 0);">
<text x="1" y="15">${updatedCountText}</text>
<style>text {
  font-size: 16px;
  font-family: monospace;
}</style>
</svg>`,
    };
};

async function count(counterName, sourceIpAddress, isIpCheck) {
    try {
        return await update(counterName, sourceIpAddress, isIpCheck);
    } catch {
        // 更新失敗も含めて失敗全般はgetして返す
        return await get(counterName);
    }
}

function update(counterName, sourceIpAddress, isIpCheck) {
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
            ConditionExpression: "LastIPAddress <> :v3",
            ExpressionAttributeValues: {
                ":v1": { S: sourceIpAddress },
                ":v2": { N: "1" },
                ":v3": { S: isIpCheck ? sourceIpAddress : "-" },
            }
        }, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.Attributes);
            }
        });
    });
}

function get(counterName) {
    return new Promise((resolve, reject) => {
        dynamo.getItem({
            TableName: tableName,
            Key: {
                CounterName: { S: counterName },
            },
        }, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.Item);
            }
        });
    });
}