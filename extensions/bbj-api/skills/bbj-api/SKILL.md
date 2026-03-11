---
name: bbj-api
description: 播播机服务 API，用于创建激活码、查询数据等。触发条件：用户要求创建激活码、生成邀请码或提到"播播机"/"激活码"。
command-dispatch: tool
command-tool: bbj_create_activation_code
metadata: { "openclaw": { "requires": { "config": ["plugins.entries.bbj-api.enabled"] } } }
---

# 播播机服务

使用 curl 调用播播机 API 来操作激活码。

## 服务地址

默认：`http://localhost:3011`

可通过环境变量 `BBJ_API_URL` 或配置覆盖。

## 创建激活码

向指定路径发送 POST 请求即可批量生成激活码。

**接口**

```
POST /invite-code/create/:validDays/:count
```

### 路径参数

- `validDays`：激活码有效期

| 值     | 含义   |
| ------ | ------ |
| `1`    | 1 天   |
| `30`   | 30 天  |
| `180`  | 180 天 |
| `365`  | 365 天 |
| `1001` | 1 小时 |
| `1008` | 8 小时 |

> 大于 1000 的值表示小时卡，实际小时数 = 值 - 1000

- `count`：本次生成的激活码数量

### 查询参数

- `remark`（必填）：备注，需要 URL 编码
- `price`（可选）：售价
- `settlement`（可选）：结算方式，固定值 `real`
- `liveDuration`（可选）：直播时长（秒），`0` 表示不限制

### 示例

**生成 1 个有效期 30 天的激活码：**

```bash
curl -X POST "http://localhost:3011/invite-code/create/30/1?remark=%E6%B5%8B%E8%AF%95%E6%89%B9%E6%AC%A1"
```

**生成带价格和结算信息的激活码：**

```bash
curl -X POST "http://localhost:3011/invite-code/create/30/1?remark=%E6%AD%A3%E5%BC%8F%E6%89%B9%E6%AC%A1&price=9.9&settlement=real"
```

**生成带直播时长的激活码（3600 秒 = 1 小时）：**

```bash
curl -X POST "http://localhost:3011/invite-code/create/30/1?remark=%E7%9B%B4%E6%92%AD%E6%89%B9%E6%AC%A1&liveDuration=3600"
```

**生成不限制直播时长的激活码：**

```bash
curl -X POST "http://localhost:3011/invite-code/create/30/1?remark=%E7%9B%B4%E6%92%AD%E6%89%B9%E6%AC%A1&liveDuration=0"
```

### 响应

**成功：**

```json
{
  "code": 200,
  "message": "success",
  "data": [...]
}
```

**失败：**

```json
{
  "code": 400,
  "message": "remark 参数不能为空"
}
```

## 常用命令

### 创建激活码（直接用 curl）

```bash
# 1 天，10 个
curl -X POST "http://localhost:3011/invite-code/create/1/10?remark=URL%E7%BC%96%E7%A0%81%E5%90%8E%E7%9A%84%E5%A4%87%E6%B3%A8"

# 30 天，1 个
curl -X POST "http://localhost:3011/invite-code/create/30/1?remark=%E6%B5%8B%E8%AF%95"
```
