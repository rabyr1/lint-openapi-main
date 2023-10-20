export declare function lintFromFilePaths(filePaths: string[], shouldApplyGatewayRules?: boolean, isAction?: boolean): Promise<void>;
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
export declare function lintFromString(stringifiedOpenApiSpec: string, shouldApplyGatewayRules?: boolean, isAction?: boolean): Promise<LinterOutput>;
export {};
