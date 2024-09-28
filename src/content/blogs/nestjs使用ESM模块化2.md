---
title: nestjs使用ESM模块化2
slug: nestjs-swc-esm2
description: nestjs使用ESM模块化的改造经历（不推荐上生产）2
date: 2024-09-16
image: null.jpg
---

# nestjs使用ESM模块化

## 引言

- 在去年2023年我就有想过为什么不改造成ESM模块化呢？这样可以避免大量CJS引入ESM包的错误，当我改造完毕后node服务可以正常运行，但jest单元测试始终有问题
- 今年nest支持swc、vitest后，我觉得可以再次尝试，swc将代码转为ESM模块化产物，vitest + swc运行ESM模块化产物，以此证明我的猜想



## 结论

- vitest + swc下，node服务在ESM下正常运行，vitest ESM正常运行
- 适用场景：验证自己的猜想、对构建工具的掌握、对纯node ESM的极端主义

> 🚨注意：永远不要将非官方支持的内容带入到生产环境！所以，这里只是借鉴一种思路，不保证`tsconfig-path`等各种nest扩展（swagger cli、graphQL能正常）

> 🚀原因：由于nestjs目前未有迁移到ESM的打算，尽量使用CJS正常开发业务，目前nodejs推出了`--experimental-require-module`机制（CJS/ESM允许互导包的特性，🤔忘了v22.4+还是多少可用），未来可能nestjs团队过度更慢，所以更加推荐CJS使用nestjs项目



## 项目

- [Github: nest-swc-esm](https://github.com/JYbill/nest-swc-esm)



## 测试

```bash
pnpm i
npm i

# 测试 vitest + swc的测试用例
pnpm test
pnpm test:e2e

# 运行，访问http://localhost:8888，会返回hello world！，在控制台会看到got的请求返回值
pnpm dev

# 规范测试
pnpm lint
pnpm format
```



## 实现ESM核心步骤

1. package.json的"type"设置为"module"（不理解的可以参考：https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c）

```ts
{
  ...
  "type": "module",
  ...
}
```

2. 定义swc配置文件，查看`.swcrc`文件

```ts
{
  "$schema": "https://swc.rs/schema.json",
  "jsc": {
    "target": "esnext"
  },
  "module": {
    "type": "es6"
  },
  "minify": false
}
```

3. swc与tsconfig.json的兼容性，查看`为了迁移到SWC的配置项`注释后的额外配置（swc迁移文档：https://swc.rs/docs/migrating-from-tsc）

```json
// 为了迁移到SWC的配置项
"isolatedModules": true,
"importsNotUsedAsValues": "error",
"esModuleInterop": true
```

4. ESM后 eslint v9-都不支持，所以改名为`.eslintrc.cjs`使用CJS模块化运行

```ts
module.exports = {
  // ...
  env: {
    // ...
  },
  ignorePatterns: ['.eslintrc.cjs'], // 忽略
  rules: {
    // ...
  },
};

```

5. prettier 不受影响不用管
6. 配置nest-cli.json让其支持`swc`并读取`swc`配置

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": {
        "swcrcPath": ".swcrc"
      }
    }
  }
}

```

> got这个http请求依赖包最新版是纯ESM，可以通过查看`dist`目录内的源码，根据导入语句可以分辨是否已转成ESM
