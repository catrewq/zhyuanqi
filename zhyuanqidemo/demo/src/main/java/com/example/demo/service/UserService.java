package com.example.demo.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.User;

/**
 * 用户服务接口
 */
public interface UserService extends IService<User> {

    /**
     * 根据用户名查询用户
     */
    User findByUsername(String username);

    /**
     * 验证密码
     */
    boolean validatePassword(String rawPassword, String encodedPassword);

    /**
     * 加密密码
     */
    String encodePassword(String rawPassword);
}
