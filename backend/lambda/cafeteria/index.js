const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const cafeteriaTable = process.env.CAFETERIA_TABLE;
const feedbackTable = process.env.FEEDBACK_TABLE;
const ordersTable = process.env.ORDERS_TABLE;
const imagesBucket = process.env.IMAGES_BUCKET;

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

    if (event.path === '/cafeteria/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'healthy', service: 'cafeteria' }),
      };
    }

    if (event.path.includes('/feedback')) {
      return await handleFeedback(event, headers);
    }

    if (event.path.includes('/orders')) {
      return await handleOrders(event, headers);
    }

    switch (event.httpMethod) {
      case 'GET':
        return await getMenuItems(headers);
      case 'POST':
        return await createMenuItem(event, headers);
      case 'PUT':
        return await updateMenuItem(event, headers);
      case 'DELETE':
        return await deleteMenuItem(event, headers);
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

async function getMenuItems(headers) {
  try {
    const result = await dynamodb.scan({
      TableName: cafeteriaTable,
    }).promise();

    // Get feedback for each item (simplified for now)
    const itemsWithFeedback = result.Items.map(item => ({
      ...item,
      rating: item.rating || 0,
      reviewCount: 0,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(itemsWithFeedback),
    };
  } catch (error) {
    console.error('Get menu items error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch menu items' }),
    };
  }
}

async function createMenuItem(event, headers) {
  try {
    const { name, price, category, description, available, image } = JSON.parse(event.body);

    if (!name || !price || !category) {
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
      const imageKey = `cafeteria/${itemId}.jpg`;
      const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      
      await s3.putObject({
        Bucket: imagesBucket,
        Key: imageKey,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
      }).promise();

      imageUrl = `https://${imagesBucket}.s3.amazonaws.com/${imageKey}`;
    }

    const item = {
      id: itemId,
      name,
      price: parseFloat(price),
      category,
      description: description || '',
      available: available !== false,
      image: imageUrl,
      createdAt: new Date().toISOString(),
    };

    await dynamodb.put({
      TableName: cafeteriaTable,
      Item: item,
    }).promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error('Create menu item error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create menu item' }),
    };
  }
}

async function updateMenuItem(event, headers) {
  try {
    const { id, name, price, category, description, available, image } = JSON.parse(event.body);

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing id' }),
      };
    }

    const updateExpression = [];
    const expressionAttributeValues = {};

    if (name) {
      updateExpression.push('#name = :name');
      expressionAttributeValues[':name'] = name;
    }
    if (price !== undefined) {
      updateExpression.push('price = :price');
      expressionAttributeValues[':price'] = parseFloat(price);
    }
    if (category) {
      updateExpression.push('category = :category');
      expressionAttributeValues[':category'] = category;
    }
    if (description !== undefined) {
      updateExpression.push('description = :description');
      expressionAttributeValues[':description'] = description;
    }
    if (available !== undefined) {
      updateExpression.push('available = :available');
      expressionAttributeValues[':available'] = available;
    }

    // Handle image update
    if (image) {
      const imageKey = `cafeteria/${id}.jpg`;
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
      TableName: cafeteriaTable,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: { '#name': 'name' },
      ReturnValues: 'ALL_NEW',
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error('Update menu item error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update menu item' }),
    };
  }
}

async function deleteMenuItem(event, headers) {
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
      TableName: cafeteriaTable,
      Key: { id },
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Menu item deleted successfully' }),
    };
  } catch (error) {
    console.error('Delete menu item error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete menu item' }),
    };
  }
}

async function handleFeedback(event, headers) {
  if (event.httpMethod === 'POST') {
    return await createFeedback(event, headers);
  } else if (event.httpMethod === 'GET') {
    return await getFeedback(event, headers);
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
}

async function createFeedback(event, headers) {
  try {
    const { itemId, rating, comment, userName } = JSON.parse(event.body);

    if (!itemId || !rating) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const feedback = {
      id: uuidv4(),
      itemId,
      rating: parseFloat(rating),
      comment: comment || '',
      userName: userName || 'Anonymous',
      createdAt: new Date().toISOString(),
    };

    // Save feedback
    await dynamodb.put({
      TableName: feedbackTable,
      Item: feedback,
    }).promise();

    // Calculate and update average rating for the menu item
    const feedbackResult = await dynamodb.scan({
      TableName: feedbackTable,
      FilterExpression: 'itemId = :itemId',
      ExpressionAttributeValues: {
        ':itemId': itemId,
      },
    }).promise();

    const allFeedback = feedbackResult.Items;
    const averageRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0) / allFeedback.length;

    // Update menu item with new average rating
    await dynamodb.update({
      TableName: cafeteriaTable,
      Key: { id: itemId },
      UpdateExpression: 'SET rating = :rating, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':rating': Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        ':updatedAt': new Date().toISOString(),
      },
    }).promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(feedback),
    };
  } catch (error) {
    console.error('Create feedback error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create feedback' }),
    };
  }
}

async function getFeedback(event, headers) {
  try {
    const { itemId } = event.queryStringParameters || {};

    if (!itemId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing itemId parameter' }),
      };
    }

    const result = await dynamodb.scan({
      TableName: feedbackTable,
      FilterExpression: 'itemId = :itemId',
      ExpressionAttributeValues: {
        ':itemId': itemId,
      },
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error('Get feedback error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch feedback' }),
    };
  }
}

async function handleOrders(event, headers) {
  console.log('Orders endpoint called:', event.httpMethod);
  
  if (event.httpMethod === 'POST') {
    return await createOrder(event, headers);
  } else if (event.httpMethod === 'GET') {
    return await getOrders(event, headers);
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
}

async function createOrder(event, headers) {
  try {
    console.log('Creating order with body:', event.body);
    const { itemId, itemName, price, customerName } = JSON.parse(event.body);

    if (!itemId || !itemName || !price || !customerName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const order = {
      id: uuidv4(),
      itemId,
      itemName,
      price: parseFloat(price),
      customerName,
      orderTime: new Date().toISOString(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    await dynamodb.put({
      TableName: ordersTable,
      Item: order,
    }).promise();

    console.log('Order created in DynamoDB:', order);
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(order),
    };
  } catch (error) {
    console.error('Create order error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create order' }),
    };
  }
}

async function getOrders(event, headers) {
  try {
    const result = await dynamodb.scan({
      TableName: ordersTable,
    }).promise();

    console.log('Fetched orders from DynamoDB:', result.Items.length);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error('Get orders error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch orders' }),
    };
  }
}