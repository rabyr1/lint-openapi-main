import * as core from '@actions/core';
import { lintFromFilePaths } from './linter';

async function runAction(): Promise<void> {
  try {
    const filePaths = core.getMultilineInput('files', { required: true });
    const shouldApplyGatewayRules = core.getInput('shouldApplyGatewayRules') === 'true';
    await lintFromFilePaths(filePaths, shouldApplyGatewayRules, true);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

runAction();
