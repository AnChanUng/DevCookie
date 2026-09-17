package com.csstudy.backend.service;

import com.csstudy.backend.dto.QuestionResponse;
import com.csstudy.backend.entity.Question;
import com.csstudy.backend.entity.User;
import com.csstudy.backend.entity.UserQuestionProgress;
import com.csstudy.backend.repository.UserQuestionProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 학습 횟수·북마크를 계정별로 관리한다.
 */
@Service
@RequiredArgsConstructor
public class UserProgressService {

    private final UserQuestionProgressRepository progressRepository;

    @Transactional
    public void recordStudy(User user, Question question) {
        UserQuestionProgress progress = findOrNew(user, question);
        progress.setStudyCount(progress.getStudyCount() + 1);
        progress.setLastStudiedAt(LocalDateTime.now());
        progressRepository.save(progress);
    }

    @Transactional
    public void toggleBookmark(User user, Question question) {
        UserQuestionProgress progress = findOrNew(user, question);
        progress.setBookmarked(!progress.isBookmarked());
        progressRepository.save(progress);
    }

    public long countStudied(User user) {
        return progressRepository.countByUserIdAndStudyCountGreaterThan(user.getId(), 0);
    }

    /** 응답의 학습 횟수·북마크를 해당 사용자 기준으로 채운다. 비로그인이면 기록 없음으로 본다. */
    @Transactional(readOnly = true)
    public QuestionResponse toResponse(Question question, Optional<User> user) {
        UserQuestionProgress progress = user
                .flatMap(u -> progressRepository.findByUserIdAndQuestionId(u.getId(), question.getId()))
                .orElse(null);
        return apply(QuestionResponse.from(question), progress);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> toResponses(List<Question> questions, Optional<User> user) {
        Map<Long, UserQuestionProgress> byQuestion = user
                .map(u -> progressRepository.findByUserId(u.getId()).stream()
                        .collect(Collectors.toMap(p -> p.getQuestion().getId(), Function.identity())))
                .orElse(Map.of());
        return questions.stream()
                .map(q -> apply(QuestionResponse.from(q), byQuestion.get(q.getId())))
                .toList();
    }

    private UserQuestionProgress findOrNew(User user, Question question) {
        return progressRepository.findByUserIdAndQuestionId(user.getId(), question.getId())
                .orElseGet(() -> UserQuestionProgress.builder().user(user).question(question).build());
    }

    private QuestionResponse apply(QuestionResponse response, UserQuestionProgress progress) {
        response.setBookmarked(progress != null && progress.isBookmarked());
        response.setStudyCount(progress != null ? progress.getStudyCount() : 0);
        response.setLastStudiedAt(progress != null ? progress.getLastStudiedAt() : null);
        return response;
    }
}
