package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.demo.config.DataInitializer;
import com.example.demo.entity.Inspection;
import com.example.demo.service.InspectionService;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.List;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class InspectionPersistenceTests {

    private static final String INSERT_SQL =
            "INSERT INTO `bill_inspection` "
                    + "(`year_month`, `city_code`, `city_name`, `status`, `file_url`, `file_name`, `remark`, `create_by`, `create_time`, `update_time`) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

    @MockBean
    private DataInitializer dataInitializer;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private InspectionService inspectionService;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("DELETE FROM bill_inspection");
    }

    @Test
    void plainJdbcInsertWithQuotedIdentifiersShouldWork() throws Exception {
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(INSERT_SQL)) {
            bind(statement, buildInspection(1, "001", "北京"));
            assertEquals(1, statement.executeUpdate());
        }

        assertEquals(1, countRows());
    }

    @Test
    void serviceSaveShouldPersistOneInspection() {
        boolean saved = assertDoesNotThrow(() -> inspectionService.save(buildInspection(1, "001", "北京")));
        assertTrue(saved);
        assertEquals(1, countRows());
    }

    @Test
    void serviceSaveBatchShouldPersistMultipleInspections() {
        List<Inspection> inspections = List.of(
                buildInspection(1, "001", "北京"),
                buildInspection(2, "002", "上海")
        );

        boolean saved = assertDoesNotThrow(() -> inspectionService.saveBatch(inspections));
        assertTrue(saved);
        assertEquals(2, countRows());
    }

    private Inspection buildInspection(int index, String cityCode, String cityName) {
        Inspection inspection = new Inspection();
        inspection.setYearMonth(202603);
        inspection.setCityCode(cityCode);
        inspection.setCityName(cityName);
        inspection.setStatus(index);
        inspection.setFileUrl("inspection_" + index + ".xlsx");
        inspection.setFileName("巡检单_" + cityName + "_" + index);
        inspection.setRemark("测试数据" + index);
        inspection.setCreateBy(1L);
        return inspection;
    }

    private int countRows() {
        return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM bill_inspection", Integer.class);
    }

    private void bind(PreparedStatement statement, Inspection inspection) throws Exception {
        statement.setInt(1, inspection.getYearMonth());
        statement.setString(2, inspection.getCityCode());
        statement.setString(3, inspection.getCityName());
        statement.setInt(4, inspection.getStatus());
        statement.setString(5, inspection.getFileUrl());
        statement.setString(6, inspection.getFileName());
        statement.setString(7, inspection.getRemark());
        statement.setLong(8, inspection.getCreateBy());
    }
}
