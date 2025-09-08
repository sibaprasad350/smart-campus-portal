const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

const cognito = new AWS.CognitoIdentityServiceProvider();
const USER_POOL_ID = process.env.USER_POOL_ID;

const dbConfig = {
  host: process.env.DB_HOST,
  user: 'admin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

exports.handler = async (event) => {
  console.log('UserManagement Lambda received event:', JSON.stringify(event, null, 2));
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    if (event.path === '/users/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'healthy', service: 'user-management' }),
      };
    }

    switch (event.httpMethod) {
      case 'GET':
        return await getUsers(headers);
      case 'POST':
        return await createUser(event, headers);
      case 'PUT':
        return await updateUser(event, headers);
      case 'DELETE':
        return await deleteUser(event, headers);
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

// Global users storage
let usersStorage = [
  { id: 1, user_id: 'admin001', name: 'Administrator', email: 'admin001@campus.edu', user_type: 'Admin', status: 'Active', created_at: '2024-01-01' },
  { id: 2, user_id: 'student001', name: 'John Doe', email: 'student001@campus.edu', user_type: 'Student', status: 'Active', created_at: '2024-01-15' },
  { id: 3, user_id: 'student002', name: 'Jane Smith', email: 'student002@campus.edu', user_type: 'Student', status: 'Active', created_at: '2024-01-16' },
  { id: 4, user_id: 'student003', name: 'Mike Johnson', email: 'student003@campus.edu', user_type: 'Student', status: 'Inactive', created_at: '2024-01-10' },
];

async function getUsers(headers) {
  try {
    console.log('Fetching users from Cognito...');
    
    // Fetch users from Cognito User Pool
    const cognitoUsers = await cognito.listUsers({
      UserPoolId: USER_POOL_ID
    }).promise();
    
    // Transform Cognito users to our format
    const users = cognitoUsers.Users.map((user, index) => {
      const attributes = {};
      user.UserAttributes.forEach(attr => {
        attributes[attr.Name] = attr.Value;
      });
      
      return {
        id: index + 1,
        user_id: user.Username,
        name: attributes.name || user.Username,
        email: attributes.email || '',
        user_type: attributes['custom:user_type'] || 'Student',
        status: user.UserStatus === 'CONFIRMED' ? 'Active' : 'Inactive',
        created_at: user.UserCreateDate ? user.UserCreateDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
    });
    
    console.log('Fetched users from Cognito:', users.length);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(users),
    };
  } catch (error) {
    console.error('Get users error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch users' }),
    };
  }
}

async function createUser(event, headers) {
  try {
    console.log('Creating user with body:', event.body);
    const { userId, name, email, userType, status, password } = JSON.parse(event.body);
    console.log('Parsed data:', { userId, name, email, userType, status });

    if (!userId || !name || !email || !userType || !password) {
      console.log('Missing required fields');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Check if user already exists in storage
    const existing = usersStorage.find(u => u.user_id === userId || u.email === email);
    if (existing) {
      console.log('User already exists');
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'User already exists' }),
      };
    }

    // Create user in Cognito User Pool
    try {
      const cognitoParams = {
        UserPoolId: USER_POOL_ID,
        Username: userId,
        TemporaryPassword: password,
        MessageAction: 'SUPPRESS', // Don't send welcome email
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: name },
          { Name: 'custom:user_type', Value: userType }
        ]
      };

      console.log('Creating user in Cognito:', cognitoParams);
      await cognito.adminCreateUser(cognitoParams).promise();

      // Set permanent password
      await cognito.adminSetUserPassword({
        UserPoolId: USER_POOL_ID,
        Username: userId,
        Password: password,
        Permanent: true
      }).promise();

      console.log('User created successfully in Cognito');
    } catch (cognitoError) {
      console.error('Cognito error:', encodeURIComponent(cognitoError.message));
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `Failed to create user in Cognito: ${encodeURIComponent(cognitoError.message)}` }),
      };
    }

    // Create new user in local storage
    const newUser = {
      id: Date.now(),
      user_id: userId,
      name,
      email,
      user_type: userType,
      status: status || 'Active',
      created_at: new Date().toISOString().split('T')[0]
    };

    usersStorage.push(newUser);
    console.log('User created successfully:', newUser);
    console.log('Total users:', usersStorage.length);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(newUser),
    };
  } catch (error) {
    console.error('Create user error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Failed to create user: ${encodeURIComponent(error.message)}` }),
    };
  }
}

async function updateUser(event, headers) {
  try {
    const { id, userId, name, email, userType, status, password } = JSON.parse(event.body);

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing id' }),
      };
    }

    const userIndex = usersStorage.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    const currentUser = usersStorage[userIndex];

    // Update user in Cognito if password is provided
    if (password) {
      try {
        await cognito.adminSetUserPassword({
          UserPoolId: USER_POOL_ID,
          Username: currentUser.user_id,
          Password: password,
          Permanent: true
        }).promise();
        console.log('Password updated in Cognito');
      } catch (cognitoError) {
        console.error('Cognito password update error:', cognitoError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: `Failed to update password in Cognito: ${encodeURIComponent(cognitoError.message)}` }),
        };
      }
    }

    // Update user attributes in Cognito
    if (name || email || userType) {
      try {
        const attributes = [];
        if (name) attributes.push({ Name: 'name', Value: name });
        if (email) attributes.push({ Name: 'email', Value: email });
        if (userType) attributes.push({ Name: 'custom:user_type', Value: userType });

        if (attributes.length > 0) {
          await cognito.adminUpdateUserAttributes({
            UserPoolId: USER_POOL_ID,
            Username: currentUser.user_id,
            UserAttributes: attributes
          }).promise();
          console.log('User attributes updated in Cognito');
        }
      } catch (cognitoError) {
        console.error('Cognito attributes update error:', cognitoError);
      }
    }

    // Update local storage
    if (userId) usersStorage[userIndex].user_id = userId;
    if (name) usersStorage[userIndex].name = name;
    if (email) usersStorage[userIndex].email = email;
    if (userType) usersStorage[userIndex].user_type = userType;
    if (status) usersStorage[userIndex].status = status;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(usersStorage[userIndex]),
    };
  } catch (error) {
    console.error('Update user error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update user' }),
    };
  }
}

async function deleteUser(event, headers) {
  try {
    const { userId } = event.queryStringParameters || {};

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing userId parameter' }),
      };
    }

    console.log('Deleting user with userId:', userId);

    // Delete user from Cognito
    try {
      await cognito.adminDeleteUser({
        UserPoolId: USER_POOL_ID,
        Username: userId
      }).promise();
      console.log('User deleted from Cognito successfully');
    } catch (cognitoError) {
      console.error('Cognito delete error:', cognitoError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `Failed to delete user from Cognito: ${encodeURIComponent(cognitoError.message)}` }),
      };
    }

    // Delete from local storage
    usersStorage = usersStorage.filter(u => u.user_id !== userId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'User deleted successfully from Cognito and local storage' }),
    };
  } catch (error) {
    console.error('Delete user error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete user' }),
    };
  }
}