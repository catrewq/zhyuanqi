package com.example.demo.service.impl;


import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Inspection;
import com.example.demo.mapper.InspectionMapper;
import com.example.demo.service.InspectionService;
import org.springframework.stereotype.Service;

/**
 * 巡检单服务实现
 */
@Service
public class InspectionServiceImpl extends ServiceImpl<InspectionMapper, Inspection> implements InspectionService {

    @Override
    public IPage<Inspection> pageQuery(Page<Inspection> page, Integer yearMonth, String cityCode, Integer status) {
        return baseMapper.selectPage(page, yearMonth, cityCode, status);
    }
}
