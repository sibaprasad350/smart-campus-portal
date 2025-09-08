const AWS = require('aws-sdk');

// Configure AWS SDK - using environment variables or IAM roles
AWS.config.update({ 
  region: process.env.AWS_REGION || 'us-west-2'
});
const cognito = new AWS.CognitoIdentityServiceProvider();

// You need to replace this with your actual User Pool ID after deployment
// This should be the actual deployed User Pool ID from CloudFormation outputs
const USER_POOL_ID = process.env.USER_POOL_ID || 'us-west-2_jN5XqMmUQ';

const defaultUsers = [
  {
    userId: 'admin001',
    name: 'Administrator',
    email: 'admin001@campus.edu',
    userType: 'Admin',
    password: 'Pass123!'
  },
  {
    userId: 'student001',
    name: 'John Doe',
    email: 'student001@campus.edu',
    userType: 'Student',
    password: 'Pass123!'
  },
  {
    userId: 'student002',
    name: 'Jane Smith',
    email: 'student002@campus.edu',
    userType: 'Student',
    password: 'Pass123!'
  },
  {
    userId: 'student003',
    name: 'Mike Johnson',
    email: 'student003@campus.edu',
    userType: 'Student',
    password: 'Pass123!'
  }
];

async function createUser(user) {
  try {
    console.log(`Creating user: ${user.userId}`);
    
    // Create user in Cognito
    const createParams = {
      UserPoolId: USER_POOL_ID,
      Username: user.userId,
      TemporaryPassword: user.password,
      MessageAction: 'SUPPRESS',
      UserAttributes: [
        { Name: 'email', Value: user.email },
        { Name: 'name', Value: user.name },
        { Name: 'custom:user_type', Value: user.userType }
      ]
    };

    await cognito.adminCreateUser(createParams).promise();
    console.log(`✓ User ${user.userId} created in Cognito`);

    // Set permanent password
    await cognito.adminSetUserPassword({
      UserPoolId: USER_POOL_ID,
      Username: user.userId,
      Password: user.password,
      Permanent: true
    }).promise();
    
    console.log(`✓ Password set for ${user.userId}`);
    
  } catch (error) {
    if (error.code === 'UsernameExistsException') {
      console.log(`⚠ User ${user.userId} already exists`);
    } else {
      console.error(`✗ Error creating user ${encodeURIComponent(user.userId)}:`, encodeURIComponent(error.message));
    }
  }
}

async function setupUsers() {
  console.log('Setting up default users in Cognito...\n');
  
  if (USER_POOL_ID === 'YOUR_USER_POOL_ID_HERE') {
    console.error('❌ Please update USER_POOL_ID in this script with your actual User Pool ID');
    console.log('You can find it in the AWS Console or CDK output after deployment');
    return;
  }
  
  for (const user of defaultUsers) {
    await createUser(user);
    console.log(''); // Empty line for readability
  }
  
  console.log('✅ Setup complete!');
  console.log('\nYou can now test login with these credentials:');
  console.log('Admin: admin001 / Pass123!');
  console.log('Student: student001 / Pass123!');
}

setupUsers().catch(console.error);