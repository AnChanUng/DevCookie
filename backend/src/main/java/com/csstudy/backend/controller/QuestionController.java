package com.csstudy.backend.controller;

import com.csstudy.backend.dto.QuestionRequest;
import com.csstudy.backend.dto.QuestionResponse;
import com.csstudy.backend.entity.Question;
import com.csstudy.backend.entity.User;
import com.csstudy.backend.service.AuthService;
import com.csstudy.backend.service.QuestionService;
import com.csstudy.backend.service.UserProgressService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;
    private final AuthService authService;
    private final UserProgressService userProgressService;

    @GetMapping
    public ResponseEntity<List<QuestionResponse>> getAll(HttpServletRequest request) {
        List<QuestionResponse> questions = userProgressService.toResponses(
                questionService.findAll(), authService.currentUser(request));
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponse> getById(@PathVariable Long id, HttpServletRequest request) {
        Question question = questionService.findById(id);
        return ResponseEntity.ok(userProgressService.toResponse(question, authService.currentUser(request)));
    }

    @PostMapping
    public ResponseEntity<QuestionResponse> create(@Valid @RequestBody QuestionRequest request) {
        Question question = questionService.create(request);
        return ResponseEntity.ok(QuestionResponse.from(question));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody QuestionRequest request) {
        Question question = questionService.update(id, request);
        return ResponseEntity.ok(QuestionResponse.from(question));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        questionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<QuestionResponse>> search(@RequestParam("q") String query, HttpServletRequest request) {
        List<QuestionResponse> results = userProgressService.toResponses(
                questionService.search(query), authService.currentUser(request));
        return ResponseEntity.ok(results);
    }

    @GetMapping("/category/{slug}")
    public ResponseEntity<List<QuestionResponse>> getByCategory(@PathVariable String slug, HttpServletRequest request) {
        List<QuestionResponse> questions = userProgressService.toResponses(
                questionService.findByCategorySlug(slug), authService.currentUser(request));
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/{id}/study")
    public ResponseEntity<QuestionResponse> study(@PathVariable Long id, HttpServletRequest request) {
        Question question = questionService.incrementStudyCount(id);
        Optional<User> user = authService.currentUser(request);
        user.ifPresent(u -> userProgressService.recordStudy(u, question));
        return ResponseEntity.ok(userProgressService.toResponse(question, user));
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<QuestionResponse> bookmark(@PathVariable Long id, HttpServletRequest request) {
        User user = authService.requireUser(request);
        Question question = questionService.findById(id);
        userProgressService.toggleBookmark(user, question);
        return ResponseEntity.ok(userProgressService.toResponse(question, Optional.of(user)));
    }
}
