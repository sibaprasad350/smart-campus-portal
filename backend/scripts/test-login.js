const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({ region: 'us-west-2' });
const cognito = new AWS.CognitoIdentityServiceProvider();

// User Pool ID from your setup script
const USER_POOL_ID = 'us-west-2_jN5XqMmUQ';

async function testLogin() {
  console.log('Testing login functionality...\n');
  
  // First, let's verify the User Pool exists
  try {
    const userPoolInfo = await cognito.describeUserPool({
      UserPoolId: USER_POOL_ID
    }).promise();
    
    console.log('✓ User Pool found:', userPoolInfo.UserPool.Name);
    console.log('✓ User Pool ID:', USER_POOL_ID);
    
    // Get the client ID
    const clients = await cognito.listUserPoolClients({
      UserPoolId: USER_POOL_ID
    }).promise();
    
    if (clients.UserPoolClients.length === 0) {
      console.error('❌ No clients found for this User Pool');
      return;
    }
    
    const CLIENT_ID = clients.UserPoolClients[0].ClientId;
    console.log('✓ Client ID:', CLIENT_ID);
    
    // Test authentication with admin001
    console.log('\n--- Testing Admin Login ---');
    await testUserAuth('admin001', 'Password123', CLIENT_ID);
    
    // Test authentication with student001
    console.log('\n--- Testing Student Login ---');
    await testUserAuth('student001', 'Password123', CLIENT_ID);
    
  } catch (error) {
    console.error('❌ Error accessing User Pool:', error.message);
    console.log('\nPossible issues:');
    console.log('1. User Pool ID might be incorrect');
    console.log('2. AWS credentials not configured');
    console.log('3. User Pool might not exist in us-west-2 region');
  }
}

async function testUserAuth(username, password, clientId) {
  try {
    // Check if user exists
    const userDetails = await cognito.adminGetUser({
      UserPoolId: USER_POOL_ID,
      Username: username
    }).promise();
    
    console.log(`✓ User ${username} exists`);
    console.log(`  - Status: ${userDetails.UserStatus}`);
    console.log(`  - Enabled: ${userDetails.Enabled}`);
    
    // Extract user attributes
    const attributes = {};
    userDetails.UserAttributes.forEach(attr => {
      attributes[attr.Name] = attr.Value;
    });
    console.log(`  - User Type: ${attributes['custom:user_type'] || 'Not set'}`);
    
    // Test authentication
    const authParams = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      UserPoolId: USER_POOL_ID,
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    };
    
    const authResult = await cognito.adminInitiateAuth(authParams).promise();
    
    if (authResult.AuthenticationResult) {
      console.log(`✓ Authentication successful for ${username}`);
      console.log(`  - Access Token: ${authResult.AuthenticationResult.AccessToken.substring(0, 50)}...`);
    } else {
      console.log(`❌ Authentication failed for ${username} - No auth result`);
    }
    
  } catch (error) {
    console.error(`❌ Error testing ${encodeURIComponent(username)}:`, encodeURIComponent(error.message));
    
    if (error.code === 'UserNotFoundException') {
      console.log(`  - User ${encodeURIComponent(username)} does not exist. Run setup-cognito-users.js first.`);
    } else if (error.code === 'NotAuthorizedException') {
      console.log(`  - Invalid credentials for ${encodeURIComponent(username)}`);
    } else if (error.code === 'UserNotConfirmedException') {
      console.log(`  - User ${encodeURIComponent(username)} is not confirmed`);
    }
  }
}

// Run the test
testLogin().catch(console.error);