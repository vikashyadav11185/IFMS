package com.nucleusteq.ifms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.nucleusteq.ifms.model.SkillEvaluation;

@Repository
public interface SkillEvaluationRepository extends JpaRepository<SkillEvaluation, Long> {
    
    @Modifying
    @Query("DELETE FROM SkillEvaluation se WHERE se.feedback.id = :feedbackId")
    void deleteAllByFeedbackId(Long feedbackId);
}