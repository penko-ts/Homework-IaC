import { DynamoDBClient, PutItemCommand, ReturnConsumedCapacity} from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { timeStamp } from "console";

const ddb = new DynamoDBClient();

export const handler = async (event: APIGatewayProxyEvent) => {
    console.log(JSON.stringify(event));
    const tableName = process.env.TABLE_NAME!;
    const topicArn = process.env.TOPIC_ARN!;

    

    // Put items in the DynamoDB table
    const putItemCommand = new PutItemCommand( {
        Item: {
            PK: {
                S: 'ORDER#...'
            },
            SK: {
                S: 'MATADATA#...'
            },
            randomNumber: { 
                N: '7'
            },
            timeStamp: {
                S: ''
            }
        },
        ReturnConsumedCapacity: 'TOTAL',
        TableName: tableName
    });
            
    const clientResponse = ddb.send(putItemCommand)

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'OK',
        }),
    }
}