package com.nucleusteq.ifms.service.impl;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.nucleusteq.ifms.dto.FeedbackDto;
import com.nucleusteq.ifms.dto.SkillEvaluationDto;
import com.nucleusteq.ifms.exception.ResourceNotFoundException;
import com.nucleusteq.ifms.mapper.FeedbackMapper;
import com.nucleusteq.ifms.model.Decision;
import com.nucleusteq.ifms.model.Feedback;
import com.nucleusteq.ifms.model.Interview;
import com.nucleusteq.ifms.model.InterviewStatus;
import com.nucleusteq.ifms.model.Rating;
import com.nucleusteq.ifms.model.SkillEvaluation;
import com.nucleusteq.ifms.repository.FeedbackRepository;
import com.nucleusteq.ifms.repository.InterviewRepository;
import com.nucleusteq.ifms.repository.SkillEvaluationRepository;
import com.nucleusteq.ifms.service.FeedbackService;

@Service
@Transactional
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final InterviewRepository interviewRepository;
    private final SkillEvaluationRepository skillEvaluationRepository;
    private final FeedbackMapper feedbackMapper;

    public FeedbackServiceImpl(FeedbackRepository feedbackRepository,
                             InterviewRepository interviewRepository,
                             SkillEvaluationRepository skillEvaluationRepository,
                             FeedbackMapper feedbackMapper) {
        this.feedbackRepository = feedbackRepository;
        this.interviewRepository = interviewRepository;
        this.skillEvaluationRepository = skillEvaluationRepository;
        this.feedbackMapper = feedbackMapper;
    }

    @Override
    public FeedbackDto submitFeedback(FeedbackDto feedbackDto) {
    	
    	if (feedbackRepository.existsByInterviewId(feedbackDto.getInterviewId())) {
            throw new RuntimeException("Feedback already exists for this interview!");
        }
        Interview interview = interviewRepository.findById(feedbackDto.getInterviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + feedbackDto.getInterviewId()));

        Feedback feedback = feedbackMapper.toEntity(feedbackDto);
        feedback.setInterview(interview);
        
        interview.setStatus(InterviewStatus.COMPLETED);
        interviewRepository.save(interview);

        // Clear existing skill evaluations
        feedback.getSkillEvaluations().clear();

        // Add new skill evaluations with null check
        if (feedbackDto.getSkillEvaluations() != null) {
            feedbackDto.getSkillEvaluations().forEach(skillEvalDto -> {
                SkillEvaluation skillEval = new SkillEvaluation();
                skillEval.setSkill(skillEvalDto.getSkill());
                
                // Handle potential null rating
                if (skillEvalDto.getRating() != null) {
                    skillEval.setRating(Rating.valueOf(skillEvalDto.getRating()));
                }
                
                skillEval.setTopics(skillEvalDto.getTopics());
                skillEval.setComments(skillEvalDto.getComments());
                feedback.addSkillEvaluation(skillEval);
            });
        }

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return feedbackMapper.toDto(savedFeedback);
    }

    @Override
    public FeedbackDto updateFeedback(Long id, FeedbackDto feedbackDto) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));
        
        feedback.setDecision(Decision.valueOf(feedbackDto.getDecision()));
        feedback.setFinalComments(feedbackDto.getFinalComments());
        
        // Update skill evaluations safely
        feedback.getSkillEvaluations().clear();
        if (feedbackDto.getSkillEvaluations() != null && !feedbackDto.getSkillEvaluations().isEmpty()) {
            feedbackDto.getSkillEvaluations().forEach(skillEvalDto -> {
                SkillEvaluation skillEval = new SkillEvaluation();
                skillEval.setSkill(skillEvalDto.getSkill());
                skillEval.setRating(Rating.valueOf(skillEvalDto.getRating()));
                skillEval.setTopics(skillEvalDto.getTopics());
                skillEval.setComments(skillEvalDto.getComments());
                feedback.addSkillEvaluation(skillEval);
            });
        }
        
        Feedback updatedFeedback = feedbackRepository.save(feedback);
        return feedbackMapper.toDto(updatedFeedback);
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackDto getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));
        return feedbackMapper.toDto(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackDto getFeedbackByInterviewId(Long interviewId) {
        Feedback feedback = feedbackRepository.findByInterviewId(interviewId);
        if (feedback == null) {
            return null;
        }
        return feedbackMapper.toDto(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackDto> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(feedbackMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteFeedback(Long id) {
        // 1. Fetch the feedback with skill evaluations in one query
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));
        
        // 2. Explicitly delete skill evaluations first (if cascade isn't working)
        skillEvaluationRepository.deleteAllByFeedbackId(id);
        skillEvaluationRepository.flush(); // Force immediate deletion
        
        // 3. Get interview reference before deletion
        Interview interview = feedback.getInterview();
        
        // 4. Delete the feedback
        feedbackRepository.delete(feedback);
        feedbackRepository.flush(); // Force immediate execution
        
        // 5. Update interview status if needed
        if (interview != null) {
            interview.setStatus(InterviewStatus.PENDING_FEEDBACK);
            interview.setFeedback(null); // Clear the reference
            interviewRepository.saveAndFlush(interview);
        }
        if (feedbackRepository.existsById(id)) {
            throw new IllegalStateException("Deletion failed for feedback: " + id);
        }
    }
}