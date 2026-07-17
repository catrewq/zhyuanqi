package com.example.demo.dto;


import lombok.Data;
import java.io.Serializable;

/**
 * 统一响应类
 */
@Data
public class Result<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    private boolean success;
    private String message;
    private T data;
    private Integer rtnCode;
    private String rtnMessage;

    /**
     * 成功响应
     */
    public static <T> Result<T> ok() {
        Result<T> result = new Result<>();
        result.setSuccess(true);
        result.setMessage("操作成功");
        result.setRtnCode(0);
        result.setRtnMessage("成功");
        return result;
    }

    /**
     * 成功响应带数据
     */
    public static <T> Result<T> ok(T data) {
        Result<T> result = ok();
        result.setData(data);
        return result;
    }

    /**
     * 成功响应带数据和消息
     */
    public static <T> Result<T> ok(T data, String message) {
        Result<T> result = ok(data);
        result.setMessage(message);
        return result;
    }

    /**
     * 错误响应
     */
    public static <T> Result<T> error(String message) {
        Result<T> result = new Result<>();
        result.setSuccess(false);
        result.setMessage(message);
        result.setRtnCode(-1);
        result.setRtnMessage(message);
        return result;
    }

    /**
     * 错误响应带错误码
     */
    public static <T> Result<T> error(Integer code, String message) {
        Result<T> result = error(message);
        result.setRtnCode(code);
        return result;
    }
}
