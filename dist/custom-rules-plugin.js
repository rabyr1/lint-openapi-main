/* eslint-disable import/no-commonjs */

module.exports = {
  id: 'custom',
  assertions: {
    checkIfPathsContainVerbs: (paths, options, location) => {
      const containingVerbs = new Set();
      for (const verb of options.verbs) {
        for (const path of paths) {
          if (path.includes(verb)) {
            containingVerbs.add(path);
          }
        }
      }

      if (!containingVerbs.size) {
        return [];
      }

      return [{ message: `Path(s) ${Array.from(containingVerbs).join(', ')} should not contain verbs.`, location }];
    },

    checkIfServerDescriptionContainsKeywords: (description, options, location) => {
      if (!description) {
        return [
          {
            message: `Server must have description that contains one of the environment keywords: ${options.keywords.join(
              ', '
            )}`,
            location,
          },
        ];
      }
      const hasOneOfKeywords = options.keywords.some(keyword => description.includes(keyword));

      if (hasOneOfKeywords) {
        return [];
      }

      return [
        {
          message: `Server description must contain an environment keyword - valid values are: ${options.keywords.join(
            ', '
          )}`,
          location: location.child(['servers']).key(),
        },
      ];
    },

    basePathHasValidName: (url, options, location) => {
      const invalidBasePaths = new Set();
      const basePath = new URL(url).pathname + new URL(url).search;

      if (!basePath.startsWith('/apim') && (basePath.startsWith('/api') || basePath.startsWith('/virts'))) {
        invalidBasePaths.add(basePath);
      }
      if (basePath === '/') {
        invalidBasePaths.add(basePath);
      }

      if (!invalidBasePaths.size) {
        return [];
      }

      return [
        {
          message: `Path(s) ${Array.from(invalidBasePaths).join(', ')} should not be empty or should not start with "/api" or "/virts"`,
          location,
        },
      ];
    },

    basePathHasValidFormat: (url, options, location) => {
      const invalidBasePaths = new Set();
      const basePath = new URL(url).pathname + new URL(url).search;
      if (url.endsWith('?')) {
        invalidBasePaths.add(`${basePath}?`);
      } else if (!/^[A-Za-z0-9-/.]*$/.test(basePath)) {
        invalidBasePaths.add(basePath);
      }
      if (!invalidBasePaths.size) {
        return [];
      }

      return [
        {
          message: `Path(s) ${Array.from(invalidBasePaths).join(', ')} should not contain special characters`,
          location,
        },
      ];
    },

    resourcePathHasValidFormat: (paths, options, location) => {
      const invalidResourcePaths = new Set();

      for (const path of paths) {
        if (!/^[A-Za-z0-9-/_-{}.]*$/.test(path)) {
          invalidResourcePaths.add(path);
        }
      }

      if (!invalidResourcePaths.size) {
        return [];
      }

      return [
        {
          message: `Path(s) ${Array.from(invalidResourcePaths).join(', ')} should not contain special characters`,
          location,
        },
      ];
    },

    titleHasValidFormat: (title, options, location) => {
      const invalidTitle = new Set();
      if (!/^[A-Za-z0-9-/_-\s]*$/.test(title)) {
        invalidTitle.add(title);
      }
      if (!invalidTitle.size) {
        return [];
      }

      return [
        {
          message: `Title ${Array.from(invalidTitle).join(', ')} should not contain special characters except - or _`,
          location,
        },
      ];
    },
  },
};
