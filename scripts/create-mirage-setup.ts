//scripts/create-mirage-setup.ts
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const currentDate = new Date().toISOString().split('T')[0];

// Function to run pnpm command
function runPnpmCommand(command: string) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Failed to run command: ${command}`);
    console.error(error);
    return false;
  }
}

// Function to check if package is installed
function isPackageInstalled(packageName: string): boolean {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return !!(packageJson.dependencies?.[packageName] || packageJson.devDependencies?.[packageName]);
}

// Function to check if node_modules folder exists
function checkNodeModules(packageName: string): boolean {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules', packageName);
  return fs.existsSync(nodeModulesPath);
}

// Install miragejs and its types
console.log('Installing miragejs and @types/miragejs...');
const installSuccess = runPnpmCommand('pnpm add -D miragejs @types/miragejs');

if (!installSuccess) {
  console.error('Failed to install packages. Exiting.');
  process.exit(1);
}

// Check if packages are installed correctly
if (!isPackageInstalled('miragejs') || !checkNodeModules('miragejs')) {
  console.error('miragejs is not properly installed. Exiting.');
  process.exit(1);
}

if (!isPackageInstalled('@types/miragejs') || !checkNodeModules('@types/miragejs')) {
  console.error('@types/miragejs is not properly installed. Exiting.');
  process.exit(1);
}

console.log('miragejs and @types/miragejs are successfully installed.');

// Rest of the file creation logic...
const files = [
  {
    path: 'mirage/config.ts',
    content: `import { Server, Model, Factory, Response } from 'miragejs';
// File: mirage/config.ts, Author: myAI, Date: ${currentDate}

export default function (this: Server) {
  this.namespace = 'api';

  this.resource('users');

  this.models = {
    user: Model,
  };

  this.factories = {
    user: Factory.extend({
      name(i: number) {
        return \`User \${i + 1}\`;
      },
      email(i: number) {
        return \`user\${i + 1}@example.com\`;
      },
    }),
  };

  this.seeds = (server) => {
    server.createList('user', 10);
  };

  this.get('/users/:id', (schema, request) => {
    const id = request.params.id;
    return schema.find('user', id);
  });

  this.post('/users', (schema, request) => {
    const attrs = JSON.parse(request.requestBody);
    return schema.create('user', attrs);
  });

  this.passthrough();
}
`
  },
  {
    path: 'app/app.ts',
    content: `import Application from '@ember/application';
// File: app/app.ts, Author: myAI, Date: ${currentDate}
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);

if (config.environment !== 'production') {
  // @ts-ignore
  import('./mirage/config').then(module => {
    const Server = (window as any).Server;
    return new Server({
      environment: config.environment,
      ...module.default(),
    });
  });
}
`
  },
  {
    path: 'config/environment.js',
    content: `'use strict';
// File: config/environment.js, Author: myAI, Date: ${currentDate}

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'your-app-name',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
`
  },
  {
    path: 'tsconfig.json',
    content: `{
  "comment-filename": "tsconfig.json, Author: myAI, Date: ${currentDate}",
  "compilerOptions": {
    "target": "es2020",
    "allowJs": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noEmitOnError": false,
    "noEmit": true,
    "inlineSourceMap": true,
    "inlineSources": true,
    "baseUrl": ".",
    "module": "es6",
    "experimentalDecorators": true,
    "paths": {
      "your-app-name/tests/*": ["tests/*"],
      "your-app-name/*": ["app/*"],
      "*": ["types/*"]
    },
    "types": ["ember-cli-mirage"]
  },
  "include": [
    "app/**/*",
    "tests/**/*",
    "types/**/*",
    "mirage/**/*"
  ]
}
`
  }
];

function createFileWithContent(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  console.log(`Created file: ${filePath}`);
}

files.forEach(file => {
  createFileWithContent(file.path, file.content);
});

console.log('All files have been created successfully.');
