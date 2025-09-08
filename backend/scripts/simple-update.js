const AWS = require('aws-sdk');

// Configure AWS SDK - using environment variables or IAM roles
AWS.config.update({ 
  region: process.env.AWS_REGION || 'us-west-2'
});

const lambda = new AWS.Lambda();

async function testAndUpdateLambda() {
  try {
    console.log('Testing current Lambda function...');
    
    // Find the function
    const functions = await lambda.listFunctions().promise();
    const userMgmtFunction = functions.Functions.find(f => 
      f.FunctionName.includes('UserManagement')
    );
    
    if (!userMgmtFunction) {
      console.error('Function not found');
      return;
    }
    
    console.log('Found function:', userMgmtFunction.FunctionName);
    
    // Update environment variables to include credentials
    await lambda.updateFunctionConfiguration({
      FunctionName: userMgmtFunction.FunctionName,
      Environment: {
        Variables: {
          USER_POOL_ID: process.env.USER_POOL_ID || 'us-west-2_jN5XqMmUQ',
          AWS_DEFAULT_REGION: process.env.AWS_REGION || 'us-west-2'
        }
      }
    }).promise();
    
    console.log('✅ Lambda environment updated with credentials!');
    console.log('Now test the User Management API...');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAndUpdateLambda();