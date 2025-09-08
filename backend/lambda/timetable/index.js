const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TIMETABLE_TABLE;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    switch (event.httpMethod) {
      case 'GET':
        if (event.path === '/timetable/health') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ status: 'healthy', service: 'timetable' }),
          };
        }
        return await getTimetable(headers);
      case 'POST':
        return await createTimetableEntry(event, headers);
      case 'PUT':
        return await updateTimetableEntry(event, headers);
      case 'DELETE':
        return await deleteTimetableEntry(event, headers);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function getTimetable(headers) {
  try {
    const result = await dynamodb.scan({
      TableName: tableName,
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error('Get timetable error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch timetable' }),
    };
  }
}

async function createTimetableEntry(event, headers) {
  try {
    const { subject, time, room, faculty, day } = JSON.parse(event.body);

    if (!subject || !time || !room || !faculty || !day) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const item = {
      id: uuidv4(),
      subject,
      time,
      room,
      faculty,
      day,
      createdAt: new Date().toISOString(),
    };

    await dynamodb.put({
      TableName: tableName,
      Item: item,
    }).promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error('Create timetable entry error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create timetable entry' }),
    };
  }
}

async function updateTimetableEntry(event, headers) {
  try {
    const { id, subject, time, room, faculty, day } = JSON.parse(event.body);

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing id' }),
      };
    }

    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (subject) {
      updateExpression.push('#subject = :subject');
      expressionAttributeNames['#subject'] = 'subject';
      expressionAttributeValues[':subject'] = subject;
    }
    if (time) {
      updateExpression.push('#time = :time');
      expressionAttributeNames['#time'] = 'time';
      expressionAttributeValues[':time'] = time;
    }
    if (room) {
      updateExpression.push('room = :room');
      expressionAttributeValues[':room'] = room;
    }
    if (faculty) {
      updateExpression.push('faculty = :faculty');
      expressionAttributeValues[':faculty'] = faculty;
    }
    if (day) {
      updateExpression.push('#day = :day');
      expressionAttributeNames['#day'] = 'day';
      expressionAttributeValues[':day'] = day;
    }

    updateExpression.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await dynamodb.update({
      TableName: tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ReturnValues: 'ALL_NEW',
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error('Update timetable entry error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update timetable entry' }),
    };
  }
}

async function deleteTimetableEntry(event, headers) {
  try {
    const { id } = event.queryStringParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing id parameter' }),
      };
    }

    await dynamodb.delete({
      TableName: tableName,
      Key: { id },
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Timetable entry deleted successfully' }),
    };
  } catch (error) {
    console.error('Delete timetable entry error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete timetable entry' }),
    };
  }
}