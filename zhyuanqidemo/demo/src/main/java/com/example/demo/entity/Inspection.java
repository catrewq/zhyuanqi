package com.example.demo.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 宸℃鍗曞疄浣撶被
 */
@Data
@TableName("bill_inspection")
public class Inspection implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField(value = "year_month", keepGlobalFormat = true)
    private Integer yearMonth;

    @TableField(value = "city_code", keepGlobalFormat = true)
    private String cityCode;

    @TableField(value = "city_name", keepGlobalFormat = true)
    private String cityName;

    private Integer status;

    @TableField(value = "type", keepGlobalFormat = true)
    private String type;

    @TableField(value = "file_url", keepGlobalFormat = true)
    private String fileUrl;

    @TableField(value = "file_name", keepGlobalFormat = true)
    private String fileName;

    private String remark;

    @TableField(value = "create_by", keepGlobalFormat = true)
    private Long createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}

