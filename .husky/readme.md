#### 启用ts类型检查
若要启用git提交前的 ts类型检查，需将`pre-commit`文件中的指令改为：

```sh
node .husky/type-check.cjs && npx lint-staged
```