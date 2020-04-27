## 安装依赖
  ```bash
  npm install
  ```

## 启动脚本

  #开发环境-development

  ```bash
  npm run dev -- 'minute' 'test'
  ```

  生产环境-production

  ```bash
  npm run prod -- 'minute' '测试一下'
  ```

## 自动重启

  ```bash
  pm2 start npm --name networks-status -- run prod -- minute 测试一下
  ```









