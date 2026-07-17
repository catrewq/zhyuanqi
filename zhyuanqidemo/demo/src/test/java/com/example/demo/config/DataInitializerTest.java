package com.example.demo.config;

import com.example.demo.entity.Inspection;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class DataInitializerTest {

    @Test
    void defaultInspectionDataHasAtLeastFiftyRowsWithPicType() {
        List<Inspection> inspections = DataInitializer.buildDefaultInspections();

        assertEquals(50, inspections.size());
        assertFalse(inspections.stream().anyMatch(item -> item.getType() == null || item.getType().isBlank()));
        assertFalse(inspections.stream().anyMatch(item -> item.getFileUrl() == null || item.getFileUrl().isBlank()));
        assertFalse(inspections.stream().anyMatch(item -> item.getFileName() == null || item.getFileName().isBlank()));
        assertFalse(inspections.stream().anyMatch(item -> item.getRemark() == null || item.getRemark().isBlank()));
        assertFalse(inspections.stream().anyMatch(item -> item.getCreateBy() == null));
        assertFalse(inspections.stream().anyMatch(item -> item.getYearMonth() == null));
        assertFalse(inspections.stream().anyMatch(item -> item.getCityCode() == null || item.getCityCode().isBlank()));
        assertFalse(inspections.stream().anyMatch(item -> item.getCityName() == null || item.getCityName().isBlank()));
        assertFalse(inspections.stream().anyMatch(item -> item.getStatus() == null));
        assertNotNull(inspections.get(0).getType());
    }
}
