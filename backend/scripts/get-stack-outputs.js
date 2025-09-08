const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({ region: 'us-west-2' });
const cloudformation = new AWS.CloudFormation();

async function getStackOutputs() {
  try {
    console.log('Getting CloudFormation stack outputs...\n');
    
    const stackName = 'SmartCampusStack';
    const response = await cloudformation.describeStacks({
      StackName: stackName
    }).promise();
    
    if (response.Stacks.length === 0) {
      console.error('❌ Stack not found:', stackName);
      return;
    }
    
    const stack = response.Stacks[0];
    console.log('✅ Stack Status:', stack.StackStatus);
    console.log('✅ Stack found:', stackName);
    console.log('\n--- Stack Outputs ---');
    
    if (stack.Outputs && stack.Outputs.length > 0) {
      stack.Outputs.forEach(output => {
        console.log(`${output.OutputKey}: ${output.OutputValue}`);
        if (output.Description) {
          console.log(`  Description: ${output.Description}`);
        }
        console.log('');
      });
      
      // Find the User Pool ID specifically
      const userPoolOutput = stack.Outputs.find(output => output.OutputKey === 'UserPoolId');
      if (userPoolOutput) {
        console.log('🔑 Use this User Pool ID in your setup script:');
        console.log(`USER_POOL_ID = '${userPoolOutput.OutputValue}';`);
        console.log('');
        console.log('Or set it as environment variable:');
        console.log(`set USER_POOL_ID=${userPoolOutput.OutputValue}`);
      }
    } else {
      console.log('No outputs found for this stack.');
    }
    
  } catch (error) {
    console.error('❌ Error getting stack outputs:', error.message);
    
    if (error.code === 'ValidationError') {
      console.log('\nPossible issues:');
      console.log('1. Stack name might be incorrect');
      console.log('2. Stack might not be deployed yet');
      console.log('3. AWS credentials not configured');
    }
  }
}

getStackOutputs().catch(console.error);