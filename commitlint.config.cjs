module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [ 2, 'always', [
      'feat',   // 新功能
      'fix',    // 修复Bug
      'docs',   // 文档更新
      'style',  // 代码格式调整（不影响运行）
      'refactor', // 代码重构
      'perf',   // 性能优化
      'test',   // 增加或修改测试
      'chore',  // 构建过程或辅助工具的变动
      'revert'  // 回退提交
    ]]
  }
}
