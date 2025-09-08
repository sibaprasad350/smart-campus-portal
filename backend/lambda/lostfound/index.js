const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const tableName = process.env.LOSTFOUND_TABLE;
const imagesBucket = process.env.IMAGES_BUCKET;

exports.handler = async (event) => {
  console.log('LostFound Lambda received event:', JSON.stringify(event, null, 2));
  console.log('Table name:', tableName);
  console.log('Images bucket:', imagesBucket);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    if (event.path === '/lostfound/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'healthy', service: 'lostfound', tableName, imagesBucket }),
      };
    }

    switch (event.httpMethod) {
      case 'GET':
        return await getLostFoundItems(headers);
      case 'POST':
        return await createLostFoundItem(event, headers);
      case 'PUT':
        return await updateLostFoundItem(event, headers);
      case 'DELETE':
        return await deleteLostFoundItem(event, headers);
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

async function getLostFoundItems(headers) {
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
    console.error('Get lost found items error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch lost found items' }),
    };
  }
}

async function createLostFoundItem(event, headers) {
  try {
    console.log('Creating lost found item with body:', event.body);
    const { title, description, category, location, status, reportedBy, contact, image } = JSON.parse(event.body);
    console.log('Parsed data:', { title, description, category, location, status, reportedBy, contact });

    if (!title || !description || !category || !location) {
      console.log('Missing required fields');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const itemId = uuidv4();
    let imageUrl = null;

    // Upload image to S3 if provided
    if (image) {
      console.log('Uploading image to S3');
      const imageKey = `lostfound/${itemId}.jpg`;
      const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      
      await s3.putObject({
        Bucket: imagesBucket,
        Key: imageKey,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
      }).promise();

      imageUrl = `https://${imagesBucket}.s3.amazonaws.com/${imageKey}`;
      console.log('Image uploaded:', imageUrl);
    }

    const item = {
      id: itemId,
      title,
      description,
      category,
      location,
      status: status || 'Lost',
      reportedBy: reportedBy || 'Anonymous',
      contact: contact || '',
      image: imageUrl,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    console.log('Saving item to DynamoDB:', item);
    console.log('Using table:', tableName);
    
    await dynamodb.put({
      TableName: tableName,
      Item: item,
    }).promise();

    console.log('Lost found item created successfully');
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error('Create lost found item error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Failed to create lost found item: ${error.message}` }),
    };
  }
}

async function updateLostFoundItem(event, headers) {
  try {
    const { id, title, description, category, location, status, image } = JSON.parse(event.body);

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
    if (description) {
      updateExpression.push('description = :description');
      expressionAttributeValues[':description'] = description;
    }
    if (category) {
      updateExpression.push('category = :category');
      expressionAttributeValues[':category'] = category;
    }
    if (location) {
      updateExpression.push('#location = :location');
      expressionAttributeValues[':location'] = location;
    }
    if (status) {
      updateExpression.push('#status = :status');
      expressionAttributeValues[':status'] = status;
    }

    // Handle image update
    if (image) {
      const imageKey = `lostfound/${id}.jpg`;
      const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      
      await s3.putObject({
        Bucket: imagesBucket,
        Key: imageKey,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
      }).promise();

      const imageUrl = `https://${imagesBucket}.s3.amazonaws.com/${imageKey}`;
      updateExpression.push('image = :image');
      expressionAttributeValues[':image'] = imageUrl;
    }

    updateExpression.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await dynamodb.update({
      TableName: tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: {
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
    console.error('Update lost found item error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update lost found item' }),
    };
  }
}

async function deleteLostFoundItem(event, headers) {
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
      body: JSON.stringify({ message: 'Lost found item deleted successfully' }),
    };
  } catch (error) {
    console.error('Delete lost found item error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete lost found item' }),
    };
  }
}