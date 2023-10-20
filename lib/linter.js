"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lintFromString = exports.lintFromFilePaths = void 0;
const openapi_core_1 = require("@redocly/openapi-core");
const ansi_styles_1 = __importDefault(require("ansi-styles"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const path = __importStar(require("path"));
function lintFromFilePaths(filePaths, shouldApplyGatewayRules = false, isAction = false) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`\nLinting "started"...\n`);
        const errors = [];
        const config = yield getRedoclyConfig(shouldApplyGatewayRules, isAction);
        for (const filePath of filePaths) {
            console.log(`\nLinting "${filePath}"...\n`);
            const problemList = yield (0, openapi_core_1.lint)({ config, ref: filePath });
            printOutResult(problemList, errors, filePath);
        }
        if (errors.length) {
            const errorMessage = `Following files contain errors: ${errors.join(', ')}.`;
            if (isAction) {
                throw new Error(errorMessage);
            }
            else {
                console.error(errorMessage);
            }
        }
    });
}
exports.lintFromFilePaths = lintFromFilePaths;
function printOutResult(problemList, errors, filePath) {
    for (const { message, location, ruleId, severity } of problemList) {
        const locationItem = location[0];
        const lineColLoc = (0, openapi_core_1.getLineColLocation)(locationItem);
        const lineCol = `${lineColLoc === null || lineColLoc === void 0 ? void 0 : lineColLoc.start.line}:${lineColLoc === null || lineColLoc === void 0 ? void 0 : lineColLoc.start.col}`;
        const coloredSeverity = severity === 'error'
            ? `${ansi_styles_1.default.red.open}${severity}${ansi_styles_1.default.red.close}`
            : `${ansi_styles_1.default.yellow.open}${severity}${ansi_styles_1.default.yellow.close}`;
        const linterPointer = `${ansi_styles_1.default.underline.open}${locationItem.pointer}${ansi_styles_1.default.underline.close}`;
        const linterMessage = `  ${lineCol}  ${coloredSeverity}  ${message}  ${ansi_styles_1.default.bold.open}${ruleId}${ansi_styles_1.default.bold.close}\n`;
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
        ? `${ansi_styles_1.default.yellow.open}${ansi_styles_1.default.bold.open}✖ ${problemsCountMessage} (${errorsCountMessage}, ${warningsCountMessage})${ansi_styles_1.default.bold.close}${ansi_styles_1.default.yellow.close}\n`
        : `${ansi_styles_1.default.green.open}${ansi_styles_1.default.bold.open}No problems found in the provided OpenAPI specification file.${ansi_styles_1.default.bold.close}${ansi_styles_1.default.green.close}\n`;
    console.log(finalMessage);
    if (errorsCount) {
        errors.push(`"${filePath}"`);
        console.log(`"${filePath}" contains errors.\n`);
    }
    else {
        console.log(`"${filePath}" passes linting.\n`);
    }
}
function lintFromString(stringifiedOpenApiSpec, shouldApplyGatewayRules = false, isAction = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield getRedoclyConfig(shouldApplyGatewayRules, isAction);
        const problemList = yield (0, openapi_core_1.lintFromString)({ config, source: stringifiedOpenApiSpec });
        return formatResultAsLinterOutput(problemList);
    });
}
exports.lintFromString = lintFromString;
function formatResultAsLinterOutput(problemList) {
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
function getProblemListFromRedoclyProblemList(redoclyProblemList) {
    return redoclyProblemList.map(({ message, location, ruleId }) => {
        var _a;
        const locationItem = location[0];
        const lineColLoc = (0, openapi_core_1.getLineColLocation)(locationItem);
        const lineCol = `${lineColLoc === null || lineColLoc === void 0 ? void 0 : lineColLoc.start.line}:${lineColLoc === null || lineColLoc === void 0 ? void 0 : lineColLoc.start.col}`;
        return {
            ruleId,
            description: message,
            path: (_a = locationItem.pointer) !== null && _a !== void 0 ? _a : 'unknown_path',
            location: lineCol,
        };
    });
}
function getRedoclyConfig(shouldApplyGatewayRules, isAction) {
    return __awaiter(this, void 0, void 0, function* () {
        const redoclyConfigFileName = shouldApplyGatewayRules ? 'redocly-with-gateway-rules.yaml' : 'redocly.yaml';
        const configPath = isAction
            ? `${app_root_path_1.default}/${redoclyConfigFileName}`
            : path.join(__dirname, `./../${redoclyConfigFileName}`);
        return (0, openapi_core_1.loadConfig)({ configPath });
    });
}
