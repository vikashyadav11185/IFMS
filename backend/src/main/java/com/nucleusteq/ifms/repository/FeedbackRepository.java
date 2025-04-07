package com.nucleusteq.ifms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.nucleusteq.ifms.model.Feedback;


public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
	Feedback findByInterviewId(Long interviewId);
	boolean existsByInterviewId(Long interviewId);
    
}