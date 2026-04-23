# adminpc

Vue3 + setup + Pinia + Arco Design PC 管理台。

## 启动

```bash
npm install
cp .env.example .env
npm run dev
```

默认连接 `http://localhost:3000/api/v1`。

## 模拟角色

可通过浏览器控制台设置：

```js
localStorage.setItem('x-user-role', 'HQ'); // HQ | BRANCH | AUDITOR
localStorage.setItem('x-user-id', 'u_demo_hq');
localStorage.setItem('x-user-store-id', 'store_id_here');
```
