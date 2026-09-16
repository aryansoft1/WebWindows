# WebWindows 导航 Provider v1

## 产品边界

当前版本提供 MapLibre 交互式矢量地图、全球道路与地名、地点搜索、起终点选择、当前位置、驾车道路规划、路线高亮和步骤列表。它不是车道级导航，不承诺实时交通，也不会在后台持续定位。语音引导、实时交通和可下载离线地图属于后续阶段。

无密钥社区模式使用 OpenFreeMap Liberty 矢量底图、Photon 地理编码和 OSRM 驾车路线。步行和骑行暂时仍是距离估算；外部演示服务没有 SLA，正式商业部署应改用签约或自托管服务。断网或服务限流时会回退到随应用发布的小型地点库和直线距离估算。

## 适配器与坐标

底图、地理编码和路线必须视为三个独立能力。页面只调用 `WebWindowsNavigation`；在线请求统一发送给管理员配置的同源 `proxyEndpoint`，并包含 `service=geocode|route` 和 `provider=cn-proxy|global-proxy`。代理负责供应商鉴权、速率限制、缓存、字段裁剪、许可归属和错误归一化。

- 应用内部和海外 provider 使用 WGS-84。
- 大陆 provider 边界使用 GCJ-02；适配器提供 WGS-84/GCJ-02 转换，并将台湾、香港、澳门排除在大陆自动转换范围外。精确测绘或合规要求应以获批供应商 SDK/服务端结果为准。
- 不允许在页面配置、源码、查询日志或 URL 中存放秘密服务端 Key。可公开的 Web Token 也必须按供应商要求限制域名、权限和环境。

## 供应商决策记录（2026-09-13）

| 场景 | 推荐候选 | 坐标与覆盖 | Key / 成本 | 结论 |
| --- | --- | --- | --- | --- |
| 中国大陆 | 高德或百度等已签约大陆服务 | 通常以 GCJ-02/供应商坐标体系返回，大陆地理编码与路线覆盖较好 | 需要账户、应用 Key、域名/安全配置；商业用量可能计费 | 通过 `cn-proxy` 接入，采购和条款确认前不得默认启用 |
| 海外 | Mapbox、Google Maps Platform 或已签约 OSM 商业托管 | 通常 WGS-84，全球地理编码/路线覆盖取决于套餐 | 公共 Web Token 需最小权限和 URL 限制；秘密 Token 只留服务端；按量计费 | 通过 `global-proxy` 接入，供应商可替换 |
| 无密钥社区预览 | OpenFreeMap + Photon + OSRM | WGS-84；全球矢量道路与地名，驾车道路规划 | 无 Key；公共服务无 SLA，并要求合理使用与署名 | 当前默认可用模式；上线前应切换签约或自托管服务 |
| OSM 标准瓦片 | `tile.openstreetmap.org` | 全球，但仅是社区公共瓦片服务 | 无 SLA，要求署名、缓存、身份标识并禁止批量/离线抓取 | 否决作为 WebWindows 生产默认底图；只能选择许可明确的商业托管或自托管 |

高德官方说明新申请的 JSAPI Key 需要安全密钥配置，并建议设置域名白名单；其基础服务存在配额与计费。Mapbox 区分公开与秘密 Token，并支持公开 Token 的 URL 限制。OSMF 明确指出数据开放不等于标准瓦片服务器可无限生产使用，服务可能在无通知时阻断。上线前必须由法务/运营再次核对当期条款与价格：

- https://lbs.amap.com/api/javascript-api/guide/abc/prepare
- https://lbs.amap.com/pages/base_service_price
- https://docs.mapbox.com/accounts/guides/tokens/
- https://operations.osmfoundation.org/policies/tiles/

## 同源代理契约

请求使用 POST JSON，搜索词与精确坐标不会进入 URL 或普通访问日志。请求坐标统一为 WGS-84，代理响应必须声明 `coordinateSystem`；前端会把 GCJ-02 响应归一化为 WGS-84。地理编码响应：

```json
{"results":[{"name":"北京","address":"北京市","country":"CN","lat":39.9102,"lng":116.4136,"coordinateSystem":"GCJ02"}]}
```

路线响应：

```json
{"coordinateSystem":"GCJ02","geometry":[[116.4136,39.9102],[121.4782,31.2285]],"distance":1214000,"duration":48000,"steps":[{"instruction":"向东南行驶","distance":1214000}]}
```

代理必须只允许固定供应商主机和固定 API 路径；拒绝客户端传入任意 URL；限制输入长度、坐标范围、方式枚举、超时、响应大小和每用户速率；不要记录精确位置或完整搜索词。CORS 不应开放给任意来源。

## 安全与权限

- 页面 CSP 只放行固定版本 MapLibre 浏览器构建，以及 OpenFreeMap、Photon、OSRM 三个明确的资源/接口主机；没有通配符来源。
- 搜索词只通过 URL API 编码后发往同源代理；所有展示使用 `textContent`，不拼接 HTML。
- 定位只在明确点击“定位到当前位置”后调用；拒绝、不可用和超时都有手动选点降级。
- 导航保持同源 iframe，并依赖浏览器默认的 `geolocation 'self'` 权限策略；定位仍需页面安全上下文和用户授权。
- 最小化/恢复、页面重新可见和容器尺寸变化会重算画布，不持续采集位置。

## 后续阶段

1. 选定大陆与海外供应商，完成采购/许可审查并实现服务端代理、缓存和监控。
2. 接入正式矢量底图、道路级路线与可用的地理编码，验证跨境坐标转换。
3. 在独立隐私审查后评估语音引导与实时交通。
4. 仅在供应商许可明确允许打包/预取时评估离线地图。
