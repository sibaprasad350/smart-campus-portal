const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK - using environment variables or IAM roles
AWS.config.update({ 
  region: process.env.AWS_REGION || 'us-west-2'
});

const lambda = new AWS.Lambda();

async function updateLambdaFunction() {
  try {
    console.log('Reading Lambda function code...');
    
    const functionCode = fs.readFileSync(
      path.join(__dirname, '../lambda/user-management/index.js'), 
      'utf8'
    );
    
    console.log('Updating Lambda function...');
    
    // Find the Lambda function name (it should be something like SmartCampusStack-UserManagementFunction...)
    const functions = await lambda.listFunctions().promise();
    const userMgmtFunction = functions.Functions.find(f => 
      f.FunctionName.includes('UserManagement') || f.FunctionName.includes('user-management')
    );
    
    if (!userMgmtFunction) {
      console.error('User Management Lambda function not found');
      console.log('Available functions:', functions.Functions.map(f => encodeURIComponent(f.FunctionName)));
      return;
    }
    
    console.log('Found function:', userMgmtFunction.FunctionName);
    
    // Update the function code
    await lambda.updateFunctionCode({
      FunctionName: userMgmtFunction.FunctionName,
      ZipFile: Buffer.from(`
const AWS = require('aws-sdk');

// Configure AWS SDK - using environment variables or IAM roles
AWS.config.update({ 
  region: process.env.AWS_REGION || 'us-west-2'
});

const cognito = new AWS.CognitoIdentityServiceProvider();
const USER_POOL_ID = 'us-west-2_jN5XqMmUQ';

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

    if (event.httpMethod === 'GET') {
      console.log('Fetching users from Cognito...');
      
      const cognitoUsers = await cognito.listUsers({
        UserPoolId: USER_POOL_ID
      }).promise();
      
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
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + error.message }),
    };
  }
};
      `)
    }).promise();
    
    console.log('✅ Lambda function updated successfully!');
    console.log('The User Management API should now fetch real data from Cognito.');
    
  } catch (error) {
    console.error('❌ Error updating Lambda function:', encodeURIComponent(error.message));
  }
}

updateLambdaFunction();