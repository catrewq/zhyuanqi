package com.example.demo.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.dto.Result;
import com.example.demo.entity.Inspection;
import com.example.demo.service.InspectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bill/inspection")
public class InspectionController {

    @Autowired
    private InspectionService inspectionService;

    @GetMapping("/list/{start}/{length}")
    public Result<Map<String, Object>> list(@PathVariable Integer start,
                                            @PathVariable Integer length,
                                            @RequestParam(required = false) Integer yearMonth,
                                            @RequestParam(required = false) String cityCode,
                                            @RequestParam(required = false) Integer status) {
        Page<Inspection> page = new Page<>((start / length) + 1, length);
        IPage<Inspection> result = inspectionService.pageQuery(page, yearMonth, cityCode, status);

        Map<String, Object> data = new HashMap<>();
        data.put("data", result.getRecords());
        data.put("count", result.getTotal());
        data.put("records", result.getRecords());
        data.put("total", result.getTotal());

        return Result.ok(data);
    }

    @GetMapping("/detail/{id}")
    public Result<Inspection> detail(@PathVariable Long id) {
        Inspection inspection = inspectionService.getById(id);
        if (inspection == null) {
            return Result.error("巡检单不存在");
        }
        return Result.ok(inspection);
    }

    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody Inspection inspection) {
        boolean success = inspectionService.save(inspection);
        return success ? Result.ok(true, "新增成功") : Result.error("新增失败");
    }

    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Inspection inspection) {
        boolean success = inspectionService.updateById(inspection);
        return success ? Result.ok(true, "更新成功") : Result.error("更新失败");
    }

    @DeleteMapping("/remove")
    public Result<Boolean> remove(@RequestBody List<Long> ids) {
        boolean success = inspectionService.removeByIds(ids);
        return success ? Result.ok(true, "删除成功") : Result.error("删除失败");
    }

    @DeleteMapping("/remove/batch")
    public Result<Boolean> removeBatch(@RequestBody List<Long> ids) {
        boolean success = inspectionService.removeByIds(ids);
        return success ? Result.ok(true, "批量删除成功") : Result.error("批量删除失败");
    }

    @PostMapping("/print/download/asyn")
    public Result<String> download(@RequestBody Map<String, Object> params) {
        return Result.ok("inspection_20260312.xlsx", "下载任务已创建");
    }

    @PostMapping("/gen/cache")
    public Result<Boolean> gen(@RequestBody Map<String, Object> params) {
        return Result.ok(true, "缓存已生成");
    }

    @GetMapping("/print/pic/url")
    public Result<Map<String, Object>> getPicUrl(@RequestParam Long id, @RequestParam String type) {
        Map<String, Object> data = new HashMap<>();
        List<Map<String, Object>> groups = new java.util.ArrayList<>();

        groups.add(buildPicGroup("现场照片", "800/600", 1, 20));
        groups.add(buildPicGroup("整改照片", "600/800", 21, 20));
        groups.add(buildPicGroup("其他照片", "1024/768", 41, 20));

        data.put("id", id);
        data.put("type", type);
        data.put("groups", groups);
        return Result.ok(data);
    }

    private Map<String, Object> buildPicGroup(String groupName, String size, int startRandom, int count) {
        Map<String, Object> group = new HashMap<>();
        List<String> uris = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            uris.add("https://picsum.photos/" + size + "?random=" + (startRandom + i));
        }
        group.put("groupName", groupName);
        group.put("uris", uris);
        return group;
    }}
