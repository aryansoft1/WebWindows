# WebWindows 问道 Provider v1.3

## 产品边界

当前版本提供 MapLibre 交互式矢量地图、全球道路与地名、四语界面、起终点搜索、首次定位、餐厅/景点/停车场附近搜索、路线高亮、步骤列表，以及导航期间的位置跟随和每 60 秒/移动 80 米后的路线更新。它不是车道级导航，不承诺实时交通；停止导航或关闭页面后会立即结束持续定位。语音引导、实时交通和可下载离线地图属于后续阶段。

自动模式通过同源代理按地区选择供应商：中国大陆优先高德、失败或不可用时切换百度；其他地区的驾车、步行和骑行使用 openrouteservice。海外公共交通当前明确显示不可用，不会降级成步行路线或绘制虚假直线。无密钥社区模式仍使用 OpenFreeMap Liberty 矢量底图、Photon 地理编码/附近地点和 OSRM 驾车路线。费用卡只显示供应商返回的金额，不会臆测高速费、IC 卡或现金票价。

“问桌讯”为主动触发功能：只有用户点击按钮后才把起终点名称、出行方式、距离、时长和供应商返回的费用交给桌讯；不会传递经纬度或连续轨迹。默认不在移动中主动弹出建议。

## 适配器与坐标

底图、地理编码、附近地点和路线必须视为独立能力。页面只调用 `WebWindowsNavigation`；在线请求统一发送给管理员配置的同源 `proxyEndpoint`，并包含 `service=geocode|nearby|route` 和 `provider=cn-proxy|global-proxy`。代理负责供应商鉴权、速率限制、缓存、字段裁剪、许可归属和错误归一化。

- 应用内部和海外 provider 使用 WGS-84。
- 大陆 provider 边界使用 GCJ-02；适配器提供 WGS-84/GCJ-02 转换，并将台湾、香港、澳门排除在大陆自动转换范围外。精确测绘或合规要求应以获批供应商 SDK/服务端结果为准。
- 不允许在页面配置、源码、查询日志或 URL 中存放秘密服务端 Key。可公开的 Web Token 也必须按供应商要求限制域名、权限和环境。

## 供应商决策记录（2026-09-13）

| 场景 | 推荐候选 | 坐标与覆盖 | Key / 成本 | 结论 |
| --- | --- | --- | --- | --- |
| 中国大陆 | 高德或百度等已签约大陆服务 | 通常以 GCJ-02/供应商坐标体系返回，大陆地理编码与路线覆盖较好 | 需要账户、应用 Key、域名/安全配置；商业用量可能计费 | 通过 `cn-proxy` 接入，采购和条款确认前不得默认启用 |
| 海外 | openrouteservice / HeiGIT | WGS-84；当前接入驾车、步行和骑行 Directions | API Key 只留同源 ASP 代理；公共服务有配额限制 | 通过 `global-proxy` 接入；公共交通保持独立 capability，当前不启用 |
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
{"coordinateSystem":"GCJ02","geometry":[[116.4136,39.9102],[121.4782,31.2285]],"distance":1214000,"duration":48000,"steps":[{"instruction":"向东南行驶","distance":1214000}],"costs":{"currency":"CNY","toll":582,"icCard":null,"cash":null}}
```

公交响应使用相同路线结构，`mode` 为 `transit`，并在 `costs.icCard` 和 `costs.cash` 返回可验证的总费用。金额必须来自供应商，不得由前端推算。未知值使用 `null`。若供应商能够返回分段票价，可另附 `fareBreakdown`，但前端当前只显示总额。

代理必须只允许固定供应商主机和固定 API 路径；拒绝客户端传入任意 URL；限制输入长度、坐标范围、方式枚举、超时、响应大小和每用户速率；不要记录精确位置或完整搜索词。CORS 不应开放给任意来源。

## 安全与权限

- 页面 CSP 只放行固定版本 MapLibre 浏览器构建，以及 OpenFreeMap、Photon、OSRM 三个明确的资源/接口主机；没有通配符来源。
- 搜索词只通过 URL API 编码后发往同源代理；所有展示使用 `textContent`，不拼接 HTML。
- 地图就绪后会请求一次定位权限，用当前位置代替固定的北京默认点；用户拒绝、设备不可用或超时时，按系统地区设置一个非精确的备用视图，并允许手动选点。
- 导航保持同源 iframe，并依赖浏览器默认的 `geolocation 'self'` 权限策略；定位仍需页面安全上下文和用户授权。
- 只有点击“开始导航”后才调用 `watchPosition`；移动时更新当前位置、地图朝向和剩余距离，满足节流条件后重新规划。点击停止、关闭页面都会调用 `clearWatch`。
- 最小化/恢复、页面重新可见和容器尺寸变化只会重算画布，不会额外采集位置。

## 后续阶段

1. 将 `api/navigation-proxy.config.example.asp` 复制为服务器上的 `api/navigation-proxy.config.asp`，填写 `WEBWINDOWS_AMAP_KEY`、`WEBWINDOWS_BAIDU_MAP_AK` 和 `WEBWINDOWS_ORS_API_KEY`。代理按“进程／系统环境变量 → 私有 ASP 配置 → 供应商不可用”的顺序读取。真实配置文件不进入 Git；发布脚本仅在文件不存在时创建空模板，后续发布会保留已有密钥。
2. 选择覆盖目标城市、能返回公交线路及 IC/现金票价的供应商，完成 `transit` 与 `costs` 契约。
3. 在独立隐私审查后评估语音引导、实时交通，以及由用户单独选择开启的桌讯主动建议。
4. 仅在供应商许可明确允许打包/预取时评估离线地图。
