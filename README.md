<p align="center">
  <img width="25%" height="25%" src="./assets/logo.svg">
</p>

🔥 **Latest stable version**: v1.0 ([Florence](https://en.wikipedia.org/wiki/Florence) Edition)

🤔 For **questions** use [discussions page](https://github.com/ingka-group-digital/lint-openapi/discussions)

📃 For **new feature requests and bug reports** use [issues page](https://github.com/ingka-group-digital/lint-openapi/issues)

🙌 **Join our community on [#cop-api-standards](https://ingka.slack.com/archives/C0485JDACH1) channel!**

---

## What is it?

`lint-openapi` is a GitHub action, CLI tool and NPM package that helps you find problems with your OpenAPI specification and ensure that it follows [INGKA API standards](https://github.com/ingka-group-digital/api-standards/blob/main/docs/WebAPI/README.md) maintained by API Management team.

## Why you need it?

- to make sure your OpenAPI spec file follows [INGKA API standards](https://github.com/ingka-group-digital/api-standards/blob/main/docs/WebAPI/README.md);
- to automate OpenAPI linting as part of your CI/CD pipeline;

## How to use it?

### As a GitHub action

Add the following step to your GitHub workflow job:

> **_Recommendation:_** run it before publishing the API to Kong API Gateway

```yaml
- uses: ingka-group-digital/lint-openapi@v1.0.1
    with:
      files: |
        <file-1-path>
        <file-2-path>
      shouldApplyGatewayRules: true
```

### As a GitHub workflow

You can create a separate GitHub workflow to lint-openapi spec files:

> **_Recommendation:_** run it whenever a new change in the spec files is pushed

```yaml
name: Lint OpenAPI in IKEA API Gateway

on:
  workflow_dispatch:
  push:
    paths:
      - <spec-files-path>

jobs:
  lint-openapi:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Lint OpenAPI specifications
        uses: ingka-group-digital/lint-openapi@v1.0.1
        with:
          files: |
            <file-1-path>
            <file-2-path>
          shouldApplyGatewayRules: true
```

### As an NPM package

> **_Recommendation:_** use **as a CLI** and pass the path to the OpenAPI specification .yaml file

```sh
lint-openapi ./examples/openapi-01.yaml
```

OR

> **_Recommendation:_** use **as a JS module** in your own application

```ts
// example.ts
import { lintFromFilePaths, lintFromString } from '@ingka-group-digital/lint-openapi';

// 1. In order to print out the linting result:
await lintFromFilePaths(['./examples/openapi-01.yaml']);

// 2. In order to return an output object:
const stringifiedOpenApiSpec = 'stringified-openapi-spec';
const linterOutput = await lintFromString(stringifiedOpenApiSpec);
```

#### Installing

You will need to add an npm registry entry to your `.npmrc` and set up Artifactory access in order to `npm install` the packages from this repository.

#### Adding a registry entry to .npmrc

Open up your project's `.npmrc` and add these two lines:

```
@ingka-group-digital:registry=https://artifactory.build.ingka.ikea.com/artifactory/api/npm/ingka-npm-shared-local/
//artifactory.build.ingka.ikea.com/artifactory/api/npm/ingka-npm-shared-local/:_auth=${ARTIFACTORY_AUTH_TOKEN}
```

The next section will explain how to get and set the `ARTIFACTORY_AUTH_TOKEN`.

#### Artifactory access

In order to download these libraries, you will need to configure Artifactory access on your local machine. In order to do so, you will need to create the `ARTIFACTORY_AUTH_TOKEN` environment variable containing your Artifactory auth token.

Add the following to `$HOME/.bashrc` or `$HOME/.zshrc` file:

```shell
export ARTIFACTORY_AUTH_TOKEN=___PASTE_YOUR_AUTH_TOKEN_HERE___
```

<details>
  <summary>
    How do I get my Artifactory auth token?
  </summary>

Generate your personal API key on the Artifactory [profile page](https://artifactory.build.ingka.ikea.com/ui/admin/artifactory/user_profile).

With the API key, get your personal credentials by running the following:

```shell
export ARTIFACTORY_USERNAME=___PASTE_YOUR_USERNAME_HERE___
export ARTIFACTORY_API_KEY=___PASTE_YOUR_API_KEY_HERE___

curl -u $ARTIFACTORY_USERNAME:$ARTIFACTORY_API_KEY https://artifactory.build.ingka.ikea.com/artifactory/api/npm/auth
```

And copy `_auth` value from the returned response.

Alternatively, you may create the auth token via:

```shell
export ARTIFACTORY_AUTH_TOKEN=$(echo -n $ARTIFACTORY_USERNAME:$ARTIFACTORY_API_KEY | base64)
```

Please note, however, `base64` may not be available on your environment.

</details>

## How it works?

This GitHub action runs a script on the provided OpenAPI spec file. The script analyzes the file, checks it against list of rules and shows possible problems. Under the hood it uses `@redocly/openapi-core` npm package for linting the file and configuring these rules.

> **_NOTE:_** Every rule has a `severity` property which defines the severity level of the problem if the assertion is false. Possible values are: `error`, `warn` and `off`.
>
> In case of a negative assertion:
>
> - If a rule uses `error` severity, the problem will be printed out and then the pipeline will fail.
> - If the rule uses `warn` severity, the problem will be printed out but the pipeline will continue.
> - If the rule uses `off` severity, this rule would be ignored.

## Which rules are used in this action?

Current set of rules contains recommended rules from the `@redocly/openapi-core` package and the custom rules implemented on top of the recommended ones. Both of them together form the rules which conform [INGKA API standards](https://github.com/ingka-group-digital/api-standards/blob/main/docs/WebAPI/README.md) provided by the APIM team. All rules are listed in [redocly.yaml](redocly.yaml) under the `rules` property.

### Recommended rules (26)

| Rule                                 | Severity | Description                                                                                                                                                                                                                                                                                           |
| ------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `info-license`                       | warn     | Requires the license info in your API definitions. [Read more](https://redocly.com/docs/cli/rules/info-license/)                                                                                                                                                                                      |
| `info-license-url`                   | warn     | Requires the license URL in your API definitions. [Read more](https://redocly.com/docs/cli/rules/info-license-url/)                                                                                                                                                                                   |
| `tag-description`                    | warn     | Requires that the tags all have a non-empty `description`. [Read more](https://redocly.com/docs/cli/rules/tag-description/)                                                                                                                                                                           |
| `no-path-trailing-slash`             | error    | Ensures that paths in your API do not end with a trailing slash (`/`). [Read more](https://redocly.com/docs/cli/rules/no-path-trailing-slash/)                                                                                                                                                        |
| `no-ambiguous-paths`                 | warn     | Ensures there are no ambiguous paths in your API definitions. [Read more](https://redocly.com/docs/cli/rules/no-ambiguous-paths/)                                                                                                                                                                     |
| `path-declaration-must-exist`        | error    | Requires definition of all path template variables. [Read more](https://redocly.com/docs/cli/rules/path-declaration-must-exist/)                                                                                                                                                                      |
| `path-not-include-query`             | error    | Path should not include query parameters. The query parameters should be defined on the `PathItem` or `Operation`. [Read more](https://redocly.com/docs/cli/rules/path-not-include-query/)                                                                                                            |
| `path-parameters-defined`            | error    | Requires all path template variables are defined as path parameters. [Read more](https://redocly.com/docs/cli/rules/path-parameters-defined/)                                                                                                                                                         |
| `operation-2xx-response`             | warn     | Ensures that every operation in your API document has at least one successful (200-299) HTTP response defined. [Read more](https://redocly.com/docs/cli/rules/operation-2xx-response/)                                                                                                                |
| `operation-4xx-response`             | warn     | Ensures that every operation in your API document has at least one error (400-499) HTTP response defined. [Read more](https://redocly.com/docs/cli/rules/operation-4xx-response/)                                                                                                                     |
| `operation-operationId`              | warn     | Requires each operation to have an `operationId` defined. [Read more](https://redocly.com/docs/cli/rules/operation-operationid/)                                                                                                                                                                      |
| `operation-summary`                  | error    | Enforce that every operation has a summary. [Read more](https://redocly.com/docs/cli/rules/operation-summary/)                                                                                                                                                                                        |
| `operation-operationId-unique`       | error    | Requires unique `operationId` values for each operation. [Read more](https://redocly.com/docs/cli/rules/operation-operationid-unique/)                                                                                                                                                                |
| `operation-operationId-url-safe`     | error    | Requires the `operationId` value to be URL safe. [Read more](https://redocly.com/docs/cli/rules/operation-operationid-url-safe/)                                                                                                                                                                      |
| `operation-parameters-unique`        | error    | Verifies parameters are unique for any given operation. [Read more](https://redocly.com/docs/cli/rules/operation-parameters-unique/)                                                                                                                                                                  |
| `security-defined`                   | warn     | Verifies every operation or global security is defined. [Read more](https://redocly.com/docs/cli/rules/security-defined/)                                                                                                                                                                             |
| `no-unresolved-refs`                 | error    | Ensures that all `$ref` instances in your API definitions are resolved. [Read more](https://redocly.com/docs/cli/rules/no-unresolved-refs/)                                                                                                                                                           |
| `no-enum-type-mismatch`              | error    | Requires that the contents of every `enum` value in your API definition conform to the corresponding schema's specified `type`. [Read more](https://redocly.com/docs/cli/rules/no-enum-type-mismatch/)                                                                                                |
| `spec`                               | error    | Ensures that your API document conforms to the [OpenAPI specification](https://spec.openapis.org/oas/v3.1.0.html). [Read more](https://redocly.com/docs/cli/rules/spec/)                                                                                                                              |
| `no-invalid-media-type-examples`     | warn     | Disallow invalid media type examples by ensuring they comply with the corresponding schema definitions. [Read more](https://redocly.com/docs/cli/rules/no-invalid-media-type-examples/)                                                                                                               |
| `no-server-example.com`              | warn     | Prevents using `example.com` as the value of the `servers.url` fields in your API definitions. The rule checks for all URL schemes (`http`, `https`...). [Read more](https://redocly.com/docs/cli/rules/no-server-example-com/)                                                                       |
| `no-server-trailing-slash`           | error    | Disallow servers with a trailing slash. [Read more](https://redocly.com/docs/cli/rules/no-server-trailing-slash/)                                                                                                                                                                                     |
| `no-empty-servers`                   | error    | Requires the `servers` list is defined in your API. [Read more](https://redocly.com/docs/cli/rules/no-empty-servers/)                                                                                                                                                                                 |
| `no-example-value-and-externalValue` | error    | Ensures that `examples` object properties `externalValue` and `value` are mutually exclusive. [Read more](https://redocly.com/docs/cli/rules/no-example-value-and-externalvalue/)                                                                                                                     |
| `no-unused-components`               | warn     | Ensures that every component specified in your API definition is used at least once. In this context, "used" means that a component defined in the `components` object is referenced elsewhere in the API document with `$ref`. [Read more](https://redocly.com/docs/cli/rules/no-unused-components/) |
| `no-undefined-server-variable`       | error    | Disallow undefined server variables. [Read more](https://redocly.com/docs/cli/rules/no-undefined-server-variable/)                                                                                                                                                                                    |

### Custom rules (9)

| Rule                                       | Severity | Description                                                                                                                                                                                                                 |
| ------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `openapi-version-3xx`                      | error    | Requires the `openapi` property in your API definition. Version must be 3xx.                                                                                                                                                |
| `no-verbs-in-path`                         | warn     | Ensures that paths contain only nouns, no verbs. For example, it should be `/orders` instead of `/create-orders`.                                                                                                           |
| `info-description`                         | error    | Requires `info` object to contain a `description` property.                                                                                                                                                                 |
| `info-contact`                             | error    | Requires the `Contact` info object defined in your API. [Read more](https://redocly.com/docs/cli/rules/info-contact/)                                                                                                       |
| `info-contact-email`                       | error    | Requires the `Contact` info email defined in your API.                                                                                                                                                                      |
| `operation-4xx-problem-details-rfc7807`    | warn     | Ensures that every operation with (400-499) HTTP response has content-type `application/problem+json` and fields `title` and `type`. [Read more](https://redocly.com/docs/cli/rules/operation-4xx-problem-details-rfc7807/) |
| `request-media-type-map-application-json`  | warn     | Ensures only `application/json` is used in requests.                                                                                                                                                                        |
| `response-media-type-map-application-json` | warn     | Ensures only `application/json` is used in 2xx responses.                                                                                                                                                                   |
| `sever-description-contains-keywords`      | error    | Requires server descriptions to contain an environment keyword. Valid values are: `TEST`, `STAGE` and `PROD`.                                                                                                               |

### Custom rules of Gateway (Kong) (4)

| Rule                             | Severity | Description                                                                                                                |
| -------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `base-path-has-valid-format`     | error    | API Specification has a base path and it should not have any special character, only alphabet, numbers and '/' are allowed |
| `base-path-has-valid-name`       | error    | API base path can't be empty or can't start with '/api' or '/virts'                                                                          |
| `resource-path-has-valid-format` | error    | Resource path should not have any special character, only alphabet, numbers and `/`, `{`, `}`, `.`, `-`, `_`  are allowed     
| `title-has-valid-format` | error    | Title should not have any special character, only alphabet, numbers and `-`, `_` are allowed         |

### How to use Custom rules of Gateway

For cli tool you need to pass the second parameter as true after the given filepath. Ex:

```sh
npm run start -- ./examples/openapi-01.yaml true
```

For npm package you need to use the function lintFromString and send the second parameter (shouldApplyGatewayRules) as true. Ex:

```sh
lintFromString(stringifiedSpec, true)
```

If you want to use the rules in github action you need to pass the second parameter as true after the filepaths in your workflow:

      files: |
        examples/openapi-01.yaml
        shouldApplyGatewayRules: true

## How to add and configure existing rules?

You can use any rule which comes out of the box of `redocly` package. Full list of those rules may be found [here](https://redocly.com/docs/cli/rules/). In order to override the severity of the rule which is being added via the `recommended` config or include a `redocly` rule which is not in the `recommended` config, simply add it to the [redocly.yaml](redocly.yaml) under the `rules` property like this:

```yaml
# redocly.yaml

rules:
  # Overriding severity of the rule from the recommended config.
  security-defined: warn

  # Adding a `redocly` rule which was not in the recommended config.
  info-contact: error
```

It is also possible to create custom rules.

## How to create custom rules?

In order to create custom rules you can:

- use out-of-the-box assertions;
- create custom assertion functions;

Below you may find an example of a custom rule, which uses both out-of-the-box assertions and custom ones:

```yaml
# redocly.yaml

rules:
  # Custom rule starts with an `assert/` prefix. Prefix is followed by a unique rule ID which you come up with yourself.
  assert/info-description:
    # Subject object specifies which property of which data object needs to be asserted.
    subject:
      type: Info
      property: description

    # Message is the problem message that will be shown in case the assertion is false.
    message: Info object must contain a `description` property which has minimum of 30 chars length.

    # List of assertions. You can have combine multiple assertions
    assertions:
      # Asserts if a property is defined. Comes out of the box.
      defined: true

      # Asserts a minimum length of a string.
      minLength: 30

      # Custom assertion starts with a `custom/` prefix. Prefix is followed by a function name from `custom-rules-plugin.js`.
      custom/checkIfContainsKeywords:
        # In the custom assertion options you may pass as many parameters as you want.
        # In this example we pass one `keywords` option which is an array of strings.
        keywords:
          - foo
          - bar
```

Custom assertion functions, one of which (`checkIfContainsKeywords`) we referenced in the example above, are declared in the [custom-rules-plugin.js](custom-rules-plugin.js) file:

```js
// custom-rules-plugin.js

module.exports = {
  id: 'custom',
  assertions: {
    checkIfContainsKeywords: (description, options, location) => {
      const hasOneOfKeywords = options.keywords.some(keyword => description.includes(keyword));

      // Return no problem because assertion is true.
      if (hasOneOfKeywords) {
        return [];
      }

      // Return a problem because assertion is false.
      return [{ message: `Description doesn't contain any of the keywords.`, location }];
    },
  },
};
```

For more information about `redocly` rules, custom rules and related data objects, read more information on [this page](https://redocly.com/docs/cli/rules/custom-rules/).

For more information about OpenAPI model and node types, which could be used in creation of the custom rules, read more information on [this page](https://redocly.com/docs/openapi-visual-reference/openapi-node-types/).

## Development

### Install dependencies

```sh
npm i
```

### Develop

You can start working with the codebase. In order to validate whatever you have developed run the linter locally:

```sh
npm run start -- ./examples/openapi-01.yaml
```

### Create a PR

When you are ready to create a PR, don't forget to **build** and **package** the linter before that:

```sh
npm run all
```

### :key: dependabot

By default, this action uses the `dependabot`

As described in the [official GitHub documentation](https://github.com/dependabot/dependabot-core):

> When you use the repository's dependabot finds and fixes vulnerabilities in your dependencies

### :key: release drafter

By default, this action uses the `release drafter`

As described in the [official GitHub documentation](https://github.com/marketplace/actions/release-drafter):

> When you use the repository's release drafter automatically creates a draft release on merge to main

### :pray: If you would like to contribute ?

1. Start a `discussion`
2. Create an `issue` with `feature request` or `bug` label
3. Clone and branch out
4. Push and create a PR

[Please follow this link to know more](https://github.com/ingka-group-digital/lint-openapi)
