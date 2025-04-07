package com.nucleusteq.ifms.service;

import com.nucleusteq.ifms.dto.FeedbackDto;
import java.util.List;

public interface FeedbackService {
    FeedbackDto submitFeedback(FeedbackDto feedbackDto);
    FeedbackDto updateFeedback(Long id, FeedbackDto feedbackDto);
    FeedbackDto getFeedbackById(Long id);
    FeedbackDto getFeedbackByInterviewId(Long interviewId);
    List<FeedbackDto> getAllFeedback();
    void deleteFeedback(Long id);
}