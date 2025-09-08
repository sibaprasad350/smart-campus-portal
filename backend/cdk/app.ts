#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SmartCampusStack } from './lib/smart-campus-stack';

const app = new cdk.App();
new SmartCampusStack(app, 'SmartCampusStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});