const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 正在进行 TypeScript 类型检查...');

try {
  execSync('npx tsc --noEmit --project tsconfig.app.json', {
    cwd: path.resolve(__dirname, '..'),
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log('✅ 类型检查通过');
} catch (error) {
  const output = (error.stdout || error.stderr || '').toString();
  const errors = output.split('\n').filter(line => line.includes('error TS'));

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  errors.forEach(err => {
    console.log(err);
    console.log('');
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`❌ 类型检查失败，共 ${errors.length} 个错误`);
  console.log('📝 请修复上述错误后重新提交');

  process.exit(1);
}




