package com.csstudy.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

/** Merge independent device snapshots without dropping another device's entries. */
@Service
@RequiredArgsConstructor
public class ExamProgressMerge {
    private final ObjectMapper json;

    public String merge(String existing, String incoming) {
        try {
            JsonNode right = json.readTree(incoming);
            if (right == null || !right.isObject()) throw new IllegalArgumentException();
            if (existing == null) return incoming;
            JsonNode left = json.readTree(existing);
            if (left == null || !left.isObject()) throw new IllegalArgumentException();
            ObjectNode result = ((ObjectNode) left).deepCopy();
            result.setAll((ObjectNode) right);
            for (String field : List.of("stats", "marks", "completed")) {
                if (!left.has(field) && !right.has(field)) continue;
                ObjectNode merged = json.createObjectNode();
                if (left.path(field).isObject()) merged.setAll((ObjectNode) left.path(field));
                if (right.path(field).isObject()) {
                    right.path(field).fields().forEachRemaining(entry -> {
                        JsonNode previous = merged.get(entry.getKey());
                        JsonNode next = entry.getValue();
                        if (previous == null || next.path("at").asLong(0) > previous.path("at").asLong(0)) {
                            merged.set(entry.getKey(), next);
                        }
                    });
                }
                result.set(field, merged);
            }
            if (left.path("history").isArray() || right.path("history").isArray()) {
                Map<String, JsonNode> history = new LinkedHashMap<>();
                for (JsonNode source : List.of(left.path("history"), right.path("history"))) {
                    if (!source.isArray()) continue;
                    for (JsonNode row : source) {
                        String key = row.path("at").asText() + ":" + row.path("mode").asText() + ":" + row.path("sec").asText();
                        history.putIfAbsent(key, row);
                    }
                }
                List<JsonNode> ordered = history.values().stream()
                        .sorted(Comparator.comparingLong(row -> row.path("at").asLong(0))).toList();
                ArrayNode merged = json.createArrayNode();
                ordered.subList(Math.max(0, ordered.size() - 200), ordered.size()).forEach(merged::add);
                result.set("history", merged);
            }
            if (left.has("updatedAt") || right.has("updatedAt")) {
                result.put("updatedAt", Math.max(left.path("updatedAt").asLong(0), right.path("updatedAt").asLong(0)));
            }
            return json.writeValueAsString(result);
        } catch (JsonProcessingException | IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "학습 기록 형식이 올바르지 않습니다.");
        }
    }
}
