#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const linter_1 = require("./linter");
const filePath = process.argv[2];
const shouldApplyGatewayRules = process.argv[3] === 'true';
if (!filePath) {
    console.error('Path to an OpenAPI specification .yaml file is required.');
}
else {
    (0, linter_1.lintFromFilePaths)([filePath], shouldApplyGatewayRules);
}
