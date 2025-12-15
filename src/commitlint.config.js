module.exports = {
  // 继承基础规则
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 定义 type 的可选范围
    'type-enum': [
      2, // 2 表示必须遵守，违反则提交失败
      'always',
      [
        'feat', // 新功能
        'fix', // 修复Bug
        'docs', // 文档更新
        'style', // 代码格式调整（不影响运行）
        'refactor', // 代码重构
        'perf', // 性能优化
        'test', // 增加或修改测试
        'chore', // 构建过程或辅助工具的变动
        'revert' // 回退提交
      ]
    ]
  }
}
