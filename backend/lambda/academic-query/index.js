const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.QUERIES_TABLE;

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

    if (event.path === '/academic-query/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'healthy', service: 'academic-query' }),
      };
    }

    switch (event.httpMethod) {
      case 'GET':
        return await getQueries(headers);
      case 'POST':
        return await createQuery(event, headers);
      case 'PUT':
        return await updateQuery(event, headers);
      case 'DELETE':
        return await deleteQuery(event, headers);
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

async function getQueries(headers) {
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
    console.error('Get queries error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch queries' }),
    };
  }
}

async function createQuery(event, headers) {
  try {
    const { title, description, category, priority, studentName, studentEmail } = JSON.parse(event.body);

    if (!title || !description || !category) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const item = {
      id: uuidv4(),
      title,
      description,
      category,
      priority: priority || 'Medium',
      status: 'Open',
      studentName: studentName || 'Anonymous',
      studentEmail: studentEmail || '',
      date: new Date().toISOString().split('T')[0],
      response: null,
      respondedBy: null,
      responseDate: null,
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
    console.error('Create query error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create query' }),
    };
  }
}

async function updateQuery(event, headers) {
  try {
    console.log('Updating query with body:', event.body);
    const { id, status, response, respondedBy, responseDate } = JSON.parse(event.body);

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

    if (status) {
      updateExpression.push('#status = :status');
      expressionAttributeValues[':status'] = status;
      expressionAttributeNames['#status'] = 'status';
    }
    if (response) {
      updateExpression.push('#response = :response');
      expressionAttributeValues[':response'] = response;
      expressionAttributeNames['#response'] = 'response';
    }
    if (respondedBy) {
      updateExpression.push('respondedBy = :respondedBy');
      expressionAttributeValues[':respondedBy'] = respondedBy;
    }
    if (responseDate) {
      updateExpression.push('responseDate = :responseDate');
      expressionAttributeValues[':responseDate'] = responseDate;
    }

    updateExpression.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    console.log('Update expression:', updateExpression.join(', '));
    console.log('Expression values:', expressionAttributeValues);

    const updateParams = {
      TableName: tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    if (Object.keys(expressionAttributeNames).length > 0) {
      updateParams.ExpressionAttributeNames = expressionAttributeNames;
    }

    console.log('Update params:', JSON.stringify(updateParams, null, 2));
    const result = await dynamodb.update(updateParams).promise();

    console.log('Query updated successfully:', result.Attributes);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error('Update query error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Failed to update query: ${error.message}` }),
    };
  }
}

async function deleteQuery(event, headers) {
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
      body: JSON.stringify({ message: 'Query deleted successfully' }),
    };
  } catch (error) {
    console.error('Delete query error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete query' }),
    };
  }
}