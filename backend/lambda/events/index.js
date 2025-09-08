const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.EVENTS_TABLE;

exports.handler = async (event) => {
  console.log('Events Lambda received event:', JSON.stringify(event, null, 2));
  console.log('Table name:', tableName);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    if (event.path === '/events/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'healthy', service: 'events', tableName }),
      };
    }

    switch (event.httpMethod) {
      case 'GET':
        return await getEvents(headers);
      case 'POST':
        return await createEvent(event, headers);
      case 'PUT':
        return await updateEvent(event, headers);
      case 'DELETE':
        return await deleteEvent(event, headers);
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

async function getEvents(headers) {
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
    console.error('Get events error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch events' }),
    };
  }
}

async function createEvent(event, headers) {
  try {
    console.log('Creating event with body:', event.body);
    const { title, date, time, location, description, category } = JSON.parse(event.body);
    console.log('Parsed data:', { title, date, time, location, description, category });

    if (!title || !date || !time || !location) {
      console.log('Missing required fields');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const item = {
      id: uuidv4(),
      title,
      date,
      time,
      location,
      description: description || '',
      category: category || 'General',
      status: 'Upcoming',
      createdAt: new Date().toISOString(),
    };

    console.log('Saving item to DynamoDB:', item);
    console.log('Using table:', tableName);
    
    await dynamodb.put({
      TableName: tableName,
      Item: item,
    }).promise();

    console.log('Event created successfully');
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error('Create event error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Failed to create event: ${error.message}` }),
    };
  }
}

async function updateEvent(event, headers) {
  try {
    const { id, title, date, time, location, description, category, status } = JSON.parse(event.body);

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing id' }),
      };
    }

    const updateExpression = [];
    const expressionAttributeValues = {};

    if (title) {
      updateExpression.push('title = :title');
      expressionAttributeValues[':title'] = title;
    }
    if (date) {
      updateExpression.push('#date = :date');
      expressionAttributeValues[':date'] = date;
    }
    if (time) {
      updateExpression.push('#time = :time');
      expressionAttributeValues[':time'] = time;
    }
    if (location) {
      updateExpression.push('#location = :location');
      expressionAttributeValues[':location'] = location;
    }
    if (description !== undefined) {
      updateExpression.push('description = :description');
      expressionAttributeValues[':description'] = description;
    }
    if (category) {
      updateExpression.push('category = :category');
      expressionAttributeValues[':category'] = category;
    }
    if (status) {
      updateExpression.push('#status = :status');
      expressionAttributeValues[':status'] = status;
    }

    updateExpression.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await dynamodb.update({
      TableName: tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: {
        '#date': 'date',
        '#time': 'time',
        '#location': 'location',
        '#status': 'status'
      },
      ReturnValues: 'ALL_NEW',
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error('Update event error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update event' }),
    };
  }
}

async function deleteEvent(event, headers) {
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
      body: JSON.stringify({ message: 'Event deleted successfully' }),
    };
  } catch (error) {
    console.error('Delete event error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete event' }),
    };
  }
}