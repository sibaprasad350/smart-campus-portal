const AWS = require('aws-sdk');

const cognito = new AWS.CognitoIdentityServiceProvider();
const USER_POOL_ID = process.env.USER_POOL_ID || 'us-west-2_jN5XqMmUQ';
const CLIENT_ID = process.env.CLIENT_ID || '1qiqc2e2lhg5h9e0qrafm9nuv';

const dbConfig = {
  host: process.env.DB_HOST,
  user: 'admin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    if (event.httpMethod === 'POST') {
      return await handleLogin(event, headers);
    }

    if (event.httpMethod === 'GET' && event.path === '/auth/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'healthy', service: 'auth' }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function handleLogin(event, headers) {
  const { userId, password, userType } = JSON.parse(event.body);

  if (!userId || !password || !userType) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  if (password.length < 8 || password.length > 12) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Password must be between 8 to 12 characters' }),
    };
  }

  // Default test users for immediate functionality
  const testUsers = {
    'admin001': { password: 'Pass123!', userType: 'Admin', name: 'Administrator', email: 'admin001@campus.edu' },
    'student001': { password: 'Pass123!', userType: 'Student', name: 'John Doe', email: 'student001@campus.edu' },
    'student002': { password: 'Pass123!', userType: 'Student', name: 'Jane Smith', email: 'student002@campus.edu' }
  };

  // Check test users first
  const testUser = testUsers[userId];
  if (testUser && testUser.password === password && testUser.userType === userType) {
    const userData = {
      id: userId,
      userType: testUser.userType,
      name: testUser.name,
      email: testUser.email,
      token: generateToken({ userId, userType }),
    };

    console.log('Test authentication successful for user:', encodeURIComponent(userId));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ user: userData }),
    };
  }

  // Try Cognito authentication if test users fail
  try {
    const authParams = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: userId,
        PASSWORD: password
      }
    };

    console.log('Attempting Cognito authentication for user:', encodeURIComponent(userId));
    const authResult = await cognito.adminInitiateAuth(authParams).promise();
    
    if (!authResult.AuthenticationResult) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authentication failed' }),
      };
    }

    const userParams = {
      UserPoolId: USER_POOL_ID,
      Username: userId
    };

    const userDetails = await cognito.adminGetUser(userParams).promise();
    
    const attributes = {};
    userDetails.UserAttributes.forEach(attr => {
      attributes[attr.Name] = attr.Value;
    });

    const cognitoUserType = attributes['custom:user_type'] || 'Student';
    if (cognitoUserType !== userType) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid user type' }),
      };
    }

    if (!userDetails.Enabled) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'User account is disabled' }),
      };
    }

    const userData = {
      id: userId,
      userType: cognitoUserType,
      name: attributes.name || userId,
      email: attributes.email || '',
      token: authResult.AuthenticationResult.AccessToken,
    };

    console.log('Cognito authentication successful for user:', encodeURIComponent(userId));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ user: userData }),
    };
  } catch (error) {
    console.error('Cognito login error:', encodeURIComponent(error.message));
    
    // Return generic error for invalid credentials
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid credentials' }),
    };
  }
}

function generateToken(user) {
  // Simple token generation for demo
  const tokenData = {
    userId: user.userId,
    userType: user.userType,
    timestamp: Date.now()
  };
  return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}