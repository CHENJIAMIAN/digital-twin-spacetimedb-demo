# Digital Twin（SpacetimeDB-ready）

这是一个真实可跑的数字孪生 MVP：
- 设备模拟器每秒上报温度/振动/功耗
- 后端计算健康分与告警
- 前端大屏实时更新

## 一键启动

```bash
pnpm install
pnpm dev
```

启动后：
- Dashboard: http://localhost:5173
- Gateway API: http://localhost:8787

## 项目结构

- `simulator/` 设备遥测模拟
- `services/twin-gateway/` 实时网关（当前为内存实现）
- `apps/dashboard/` 可视化大屏
- `docs/spacetimedb-integration.md` SpacetimeDB 接入路线

## 为什么先这样做

你要的是“真实项目”，不是 PPT。
先把业务链路跑通，再把存储/同步层切到 SpacetimeDB，风险最低、速度最快。

## 发布到 GitHub Pages（前端）+ Render（后端）

### 1) 先部署后端（Render）

- 在 Render 新建 **Web Service**，选择目录：`services/twin-gateway`
- 运行方式选 Docker（项目已内置 `Dockerfile`）
- 部署成功后拿到公网地址，例如：
  - `https://digital-twin-gateway.onrender.com`

### 2) 发布前端到 GitHub Pages

前端是纯静态页，直接把 `apps/dashboard/src/index.html` 放到 Pages 即可。

上线后访问时加参数绑定后端：

```text
https://<你的用户名>.github.io/<仓库名>/?api=https://digital-twin-gateway.onrender.com&ws=wss://digital-twin-gateway.onrender.com
```

> 注意：`api` 用 https，`ws` 用 wss。

### 3) 快速自检

- 页面能看到设备列表滚动更新
- 告警等级会在 normal/warning/critical 变化
- 顶部显示 API/WS 地址为你的公网地址

## 下一步（我可以继续做）

- 直接给你补 `spacetimedb module` 初版（Rust reducers + table schema）
- 接入真实订阅，把当前 ws 替换成 Spacetime client
- 加一版 3D 车间视图（Three.js）
