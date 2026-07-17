package com.example.demo.service;


import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.Inspection;

/**
 * 巡检单服务接口
 */
public interface InspectionService extends IService<Inspection> {

    /**
     * 分页查询巡检单
     */
    IPage<Inspection> pageQuery(Page<Inspection> page, Integer yearMonth, String cityCode, Integer status);
}
