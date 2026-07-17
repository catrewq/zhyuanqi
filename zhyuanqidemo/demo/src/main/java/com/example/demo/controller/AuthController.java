package com.example.demo.controller;

import com.example.demo.dto.Result;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import com.example.demo.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/account/user")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params,
                                             HttpServletResponse response) {
        String username = params.get("username");
        String password = params.get("password");
        String validateCode = params.get("validateCode");

        User user = userService.findByUsername(username);
        if (user == null) {
            return Result.error("用户不存在");
        }

        if (!userService.validatePassword(password, user.getPassword())) {
            return Result.error("密码错误");
        }

        if (user.getStatus() != 1) {
            return Result.error("账号已被禁用");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        String sessionId = UUID.randomUUID().toString().replace("-", "");

        response.setHeader("token", token);
        response.setHeader("ssessionid", sessionId);

        Map<String, Object> result = new HashMap<>();
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("operatorId", String.valueOf(user.getId()));
        userInfo.put("username", user.getUsername());
        userInfo.put("name", user.getName());

        Map<String, Object> info = new HashMap<>();
        info.put("initPwd", user.getInitPwd());
        if (validateCode != null) {
            info.put("validateCode", validateCode);
        }

        result.put("userInfo", userInfo);
        result.put("info", info);

        return Result.ok(result, "登录成功");
    }

    @GetMapping("/validate/code")
    public void getCaptcha(HttpServletResponse response) throws Exception {
        response.setContentType("image/png");
        response.getOutputStream().write(new byte[]{});
    }

    @PutMapping("/pwd/update")
    public Result<Boolean> updatePassword(@RequestBody Map<String, Object> params) {
        Object accountIdObj = params.get("accountId");
        String oldPassword = (String) params.get("password");
        String newPassword = (String) params.get("newPassword");

        if (accountIdObj == null) {
            return Result.error("用户ID不能为空");
        }
        if (oldPassword == null || oldPassword.isEmpty()) {
            return Result.error("原密码不能为空");
        }
        if (newPassword == null || newPassword.isEmpty()) {
            return Result.error("新密码不能为空");
        }

        Long accountId;
        if (accountIdObj instanceof Number) {
            accountId = ((Number) accountIdObj).longValue();
        } else {
            accountId = Long.parseLong(accountIdObj.toString());
        }

        User user = userService.getById(accountId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        if (!userService.validatePassword(oldPassword, user.getPassword())) {
            return Result.error("原密码错误");
        }

        user.setPassword(userService.encodePassword(newPassword));
        user.setInitPwd(false);
        boolean success = userService.updateById(user);

        return success ? Result.ok(true, "修改密码成功") : Result.error("修改密码失败");
    }
}
