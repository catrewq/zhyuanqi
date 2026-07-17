package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

class DemoApplicationTests {

    @Test
    void sourceTreeShouldNotReferenceLegacyPackage() throws IOException {
        String legacyPackage = "com." + "zhyuanqi";

        try (Stream<Path> paths = Files.walk(Path.of("src/main"))) {
            List<String> violations = paths
                    .filter(Files::isRegularFile)
                    .filter(this::isConfigOrJavaSource)
                    .flatMap(path -> findLegacyPackageReferences(path, legacyPackage))
                    .collect(Collectors.toList());

            assertTrue(violations.isEmpty(), () -> String.join(System.lineSeparator(), violations));
        }
    }

    private boolean isConfigOrJavaSource(Path path) {
        String name = path.toString();
        return name.endsWith(".java") || name.endsWith(".yml") || name.endsWith(".yaml") || name.endsWith(".properties");
    }

    private Stream<String> findLegacyPackageReferences(Path path, String legacyPackage) {
        try {
            List<String> lines = Files.readAllLines(path);
            return lines.stream()
                    .filter(line -> line.contains(legacyPackage))
                    .map(line -> path + ": " + line.trim());
        } catch (IOException exception) {
            throw new RuntimeException("Failed to read " + path, exception);
        }
    }
}
