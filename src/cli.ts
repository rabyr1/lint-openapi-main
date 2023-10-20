#!/usr/bin/env node

import { lintFromFilePaths } from './linter';

const filePath = process.argv[2];
const shouldApplyGatewayRules = process.argv[3] === 'true';

if (!filePath) {
  console.error('Path to an OpenAPI specification .yaml file is required.');
} else {
  lintFromFilePaths([filePath], shouldApplyGatewayRules);
}
