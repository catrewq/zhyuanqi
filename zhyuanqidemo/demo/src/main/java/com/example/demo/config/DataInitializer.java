package com.example.demo.config;

import com.example.demo.entity.Inspection;
import com.example.demo.entity.User;
import com.example.demo.service.InspectionService;
import com.example.demo.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Autowired
    private InspectionService inspectionService;

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) {
        createTables();
        initAdminUser();
        initInspectionData();
    }

    private void createTables() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            stmt.execute("CREATE TABLE IF NOT EXISTS `sys_user` (" +
                    "  `id` BIGINT NOT NULL AUTO_INCREMENT," +
                    "  `username` VARCHAR(50) NOT NULL," +
                    "  `password` VARCHAR(255) NOT NULL," +
                    "  `name` VARCHAR(50)," +
                    "  `phone` VARCHAR(20)," +
                    "  `email` VARCHAR(100)," +
                    "  `status` INT DEFAULT 1," +
                    "  `init_pwd` TINYINT(1) DEFAULT 0," +
                    "  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                    "  `deleted` INT DEFAULT 0," +
                    "  PRIMARY KEY (`id`)" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            stmt.execute("CREATE TABLE IF NOT EXISTS `bill_inspection` (" +
                    "  `id` BIGINT NOT NULL AUTO_INCREMENT," +
                    "  `year_month` INT," +
                    "  `city_code` VARCHAR(20)," +
                    "  `city_name` VARCHAR(50)," +
                    "  `status` INT," +
                    "  `type` VARCHAR(50)," +
                    "  `file_url` VARCHAR(255)," +
                    "  `file_name` VARCHAR(255)," +
                    "  `remark` VARCHAR(500)," +
                    "  `create_by` BIGINT," +
                    "  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                    "  `deleted` INT DEFAULT 0," +
                    "  PRIMARY KEY (`id`)" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            addColumnIfMissing(conn, stmt, "bill_inspection", "type", "`type` VARCHAR(50)");

            log.info("Database tables checked");
        } catch (Exception e) {
            log.error("Failed to create database tables", e);
        }
    }

    private void addColumnIfMissing(Connection conn, Statement stmt, String tableName, String columnName, String columnDefinition) throws Exception {
        DatabaseMetaData metaData = conn.getMetaData();
        try (ResultSet columns = metaData.getColumns(conn.getCatalog(), null, tableName, columnName)) {
            if (!columns.next()) {
                stmt.execute("ALTER TABLE `" + tableName + "` ADD COLUMN " + columnDefinition);
            }
        }
    }

    private void initAdminUser() {
        User admin = userService.findByUsername("admin");
        if (admin == null) {
            log.info("Creating default admin user...");
            User user = new User();
            user.setUsername("admin");
            user.setPassword(userService.encodePassword("123456"));
            user.setName("admin");
            user.setStatus(1);
            user.setInitPwd(false);
            userService.save(user);
            log.info("Default admin user created: admin / 123456");
        } else if (!userService.validatePassword("123456", admin.getPassword())) {
            log.info("Updating admin password...");
            admin.setPassword(userService.encodePassword("123456"));
            userService.updateById(admin);
        }
    }

    private void initInspectionData() {
        long count = inspectionService.count();
        inspectionService.lambdaUpdate()
                .and(wrapper -> wrapper.isNull(Inspection::getType).or().eq(Inspection::getType, ""))
                .set(Inspection::getType, "inspection")
                .update();

        if (count > 0) {
            log.info("Inspection data already exists, count={}", count);
            return;
        }

        List<Inspection> defaults = buildDefaultInspections();
        inspectionService.saveBatch(defaults);
        log.info("Inspection seed data inserted, count={}", defaults.size());
    }

    static List<Inspection> buildDefaultInspections() {
        List<Inspection> list = new ArrayList<>();
        String[] cityCodes = {"001", "002", "003", "004", "005"};
        String[] cityNames = {"Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Hangzhou"};

        for (int i = 0; i < 50; i++) {
            int cityIdx = i % cityCodes.length;
            Inspection inspection = new Inspection();
            inspection.setYearMonth(202603);
            inspection.setCityCode(cityCodes[cityIdx]);
            inspection.setCityName(cityNames[cityIdx]);
            inspection.setStatus(i % 2 == 0 ? 1 : 2);
            inspection.setType("inspection");
            inspection.setFileUrl("inspection_202603_" + (i + 1) + ".xlsx");
            inspection.setFileName("inspection_202603_" + cityNames[cityIdx] + "_" + (i + 1));
            inspection.setRemark("pic data " + (i + 1) + ", id=db-auto, type=inspection");
            inspection.setCreateBy(1L);
            list.add(inspection);
        }

        return list;
    }
}
