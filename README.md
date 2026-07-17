修改密码接口已完成前后端对齐：

**后端新增接口** (`zhyuanqidemo/demo/src/main/java/com/example/demo/controller/AuthController.java`)：
- `PUT /account/user/pwd/update`
- 请求参数：`accountId`（用户ID）、`password`（原密码）、`newPassword`（新密码）
- 功能：验证原密码 → 加密新密码 → 更新数据库 → 设置 `initPwd=false`

**前端路径修改**：
- `src/pages/launcher/resetPassword.tsx`：`/system/account/user/pwd/update` → `/account/user/pwd/update`
- `src/layouts/User.js`：`/system/account/user/pwd/update` → `/account/user/pwd/update`

**现在所有前后端接口已完全对应：**

| 功能 | 方法 | 路径 |
|------|------|------|
| 登录 | POST | `/account/user/login` |
| 验证码 | GET | `/account/user/validate/code` |
| 修改密码 | PUT | `/account/user/pwd/update` |
| 巡检单列表 | GET | `/bill/inspection/list/{start}/{length}` |
| 巡检单详情 | GET | `/bill/inspection/detail/{id}` |
| 创建巡检单 | POST | `/bill/inspection/create` |
| 更新巡检单 | PUT | `/bill/inspection/update` |
| 删除巡检单 | DELETE | `/bill/inspection/remove` |
| 批量删除 | DELETE | `/bill/inspection/remove/batch` |
| 下载巡检单 | POST | `/bill/inspection/print/download/asyn` |
| 生成巡检单 | POST | `/bill/inspection/gen/cache` |

////
项目没有内置初始化用户数据。密码使用 BCrypt 加密。

请在 MySQL 数据库 `zhyuanqi` 中执行以下 SQL 创建用户表并插入默认账号：

```sql
CREATE TABLE IF NOT EXISTS `sys_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(50),
  `phone` VARCHAR(20),
  `email` VARCHAR(100),
  `status` INT DEFAULT 1,
  `init_pwd` TINYINT(1) DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` INT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `sys_user` (`username`, `password`, `name`, `status`, `init_pwd`)
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', 1, 0);
```

**默认登录账号密码：**
- 账号：`admin`
- 密码：`123456`