import {
  Config,
  getLineColLocation,
  lint,
  lintFromString as redoclyLintFromString,
  loadConfig,
  NormalizedProblem,
} from '@redocly/openapi-core';
import styles from 'ansi-styles';
import appRoot from 'app-root-path';
import * as path from 'path';

export async function lintFromFilePaths(
  filePaths: string[],
  shouldApplyGatewayRules = false,
  isAction = false
): Promise<void> {
  console.log(`\nLinting "started"...\n`);
  const errors: string[] = [];
  const config = await getRedoclyConfig(shouldApplyGatewayRules, isAction);

  for (const filePath of filePaths) {
    console.log(`\nLinting "${filePath}"...\n`);
    const problemList = await lint({ config, ref: filePath });
    printOutResult(problemList, errors, filePath);
  }

  if (errors.length) {
    const errorMessage = `Following files contain errors: ${errors.join(', ')}.`;

    if (isAction) {
      throw new Error(errorMessage);
    } else {
      console.error(errorMessage);
    }
  }
}

function printOutResult(problemList: NormalizedProblem[], errors: string[], filePath: string): void {
  for (const { message, location, ruleId, severity } of problemList) {
    const locationItem = location[0];
    const lineColLoc = getLineColLocation(locationItem);
    const lineCol = `${lineColLoc?.start.line}:${lineColLoc?.start.col}`;
    const coloredSeverity =
      severity === 'error'
        ? `${styles.red.open}${severity}${styles.red.close}`
        : `${styles.yellow.open}${severity}${styles.yellow.close}`;
    const linterPointer = `${styles.underline.open}${locationItem.pointer}${styles.underline.close}`;
    const linterMessage = `  ${lineCol}  ${coloredSeverity}  ${message}  ${styles.bold.open}${ruleId}${styles.bold.close}\n`;
    console.log(linterPointer);
    console.log(linterMessage);
  }

  const problemsCount = problemList.length;
  const problemsCountMessage = `${problemsCount} problem${problemsCount === 1 ? '' : 's'}`;
  const errorsCount = problemList.filter(problem => problem.severity === 'error').length;
  const errorsCountMessage = `${errorsCount} error${errorsCount === 1 ? '' : 's'}`;
  const warningsCount = problemList.filter(problem => problem.severity === 'warn').length;
  const warningsCountMessage = `${warningsCount} warning${warningsCount === 1 ? '' : 's'}`;

  const finalMessage = problemsCount
    ? `${styles.yellow.open}${styles.bold.open}✖ ${problemsCountMessage} (${errorsCountMessage}, ${warningsCountMessage})${styles.bold.close}${styles.yellow.close}\n`
    : `${styles.green.open}${styles.bold.open}No problems found in the provided OpenAPI specification file.${styles.bold.close}${styles.green.close}\n`;

  console.log(finalMessage);

  if (errorsCount) {
    errors.push(`"${filePath}"`);
    console.log(`"${filePath}" contains errors.\n`);
  } else {
    console.log(`"${filePath}" passes linting.\n`);
  }
}

export type LinterOutput = {
  [key in ProblemType]: LinterResult;
};

interface LinterResult {
  count: number;
  details: Problem[];
}

interface Problem {
  ruleId: string;
  description: string;
  path: string;
  location: string;
}

type ProblemType = 'error' | 'warning';

export async function lintFromString(
  stringifiedOpenApiSpec: string,
  shouldApplyGatewayRules = false,
  isAction = false
): Promise<LinterOutput> {
  const config = await getRedoclyConfig(shouldApplyGatewayRules, isAction);
  const problemList = await redoclyLintFromString({ config, source: stringifiedOpenApiSpec });
  return formatResultAsLinterOutput(problemList);
}

function formatResultAsLinterOutput(problemList: NormalizedProblem[]): LinterOutput {
  const errorsList = problemList.filter(({ severity }) => severity === 'error');
  const warningsList = problemList.filter(({ severity }) => severity === 'warn');

  return {
    error: {
      count: errorsList.length,
      details: getProblemListFromRedoclyProblemList(errorsList),
    },
    warning: {
      count: warningsList.length,
      details: getProblemListFromRedoclyProblemList(warningsList),
    },
  };
}

function getProblemListFromRedoclyProblemList(redoclyProblemList: NormalizedProblem[]): Problem[] {
  return redoclyProblemList.map(({ message, location, ruleId }) => {
    const locationItem = location[0];
    const lineColLoc = getLineColLocation(locationItem);
    const lineCol = `${lineColLoc?.start.line}:${lineColLoc?.start.col}`;

    return {
      ruleId,
      description: message,
      path: locationItem.pointer ?? 'unknown_path',
      location: lineCol,
    };
  });
}

async function getRedoclyConfig(shouldApplyGatewayRules: boolean, isAction: boolean): Promise<Config> {
  const redoclyConfigFileName = shouldApplyGatewayRules ? 'redocly-with-gateway-rules.yaml' : 'redocly.yaml';
  const configPath = isAction
    ? `${appRoot}/${redoclyConfigFileName}`
    : path.join(__dirname, `./../${redoclyConfigFileName}`);

  return loadConfig({ configPath });
}
