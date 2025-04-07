package com.nucleusteq.ifms.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nucleusteq.ifms.dto.FeedbackDto;
import com.nucleusteq.ifms.service.FeedbackService;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<FeedbackDto> submitFeedback(@RequestBody FeedbackDto feedbackDto) {
        FeedbackDto submittedFeedback = feedbackService.submitFeedback(feedbackDto);
        return ResponseEntity.ok(submittedFeedback);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeedbackDto> updateFeedback(@PathVariable Long id, 
                                                    @RequestBody FeedbackDto feedbackDto) {
        FeedbackDto updatedFeedback = feedbackService.updateFeedback(id, feedbackDto);
        return ResponseEntity.ok(updatedFeedback);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDto> getFeedbackById(@PathVariable Long id) {
        FeedbackDto feedback = feedbackService.getFeedbackById(id);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/interview/{interviewId}")
    public ResponseEntity<FeedbackDto> getFeedbackByInterviewId(@PathVariable Long interviewId) {
        FeedbackDto feedback = feedbackService.getFeedbackByInterviewId(interviewId);
        // If feedback is null, return 404 instead of throwing an exception
        if (feedback == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(feedback);
    }

    @GetMapping
    public ResponseEntity<List<FeedbackDto>> getAllFeedback() {
        List<FeedbackDto> feedbackList = feedbackService.getAllFeedback();
        return ResponseEntity.ok(feedbackList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok("Feedback deleted successfully");
    }
}