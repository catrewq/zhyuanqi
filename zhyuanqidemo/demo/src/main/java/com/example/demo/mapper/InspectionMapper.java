package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.entity.Inspection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 巡检单 Mapper 接口
 */
@Mapper
public interface InspectionMapper extends BaseMapper<Inspection> {

    /**
     * 分页查询巡检单
     */
    @Select("<script>" +
            "SELECT * FROM `bill_inspection` WHERE `deleted` = 0 " +
            "<if test='yearMonth != null'>AND `year_month` = #{yearMonth}</if> " +
            "<if test='cityCode != null'>AND `city_code` = #{cityCode}</if> " +
            "<if test='status != null'>AND `status` = #{status}</if> " +
            "ORDER BY `create_time` DESC" +
            "</script>")
    IPage<Inspection> selectPage(Page<Inspection> page,
                                 @Param("yearMonth") Integer yearMonth,
                                 @Param("cityCode") String cityCode,
                                 @Param("status") Integer status);
}
