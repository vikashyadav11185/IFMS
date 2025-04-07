package com.nucleusteq.ifms.controller;

import java.time.LocalDate;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.nucleusteq.ifms.dto.InterviewDto;
import com.nucleusteq.ifms.service.InterviewService;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    public ResponseEntity<InterviewDto> scheduleInterview(@RequestBody InterviewDto interviewDto) {
    	System.out.println("Received InterviewDto: " + interviewDto);
        InterviewDto scheduledInterview = interviewService.scheduleInterview(interviewDto);
        return ResponseEntity.ok(scheduledInterview);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InterviewDto> updateInterview(@PathVariable Long id, 
                                                      @RequestBody InterviewDto interviewDto) {
        InterviewDto updatedInterview = interviewService.updateInterview(id, interviewDto);
        return ResponseEntity.ok(updatedInterview);
    }

    @GetMapping
    @PreAuthorize("hasRole('HR_MANAGER') or hasRole('INTERVIEWER')")
    public ResponseEntity<List<InterviewDto>> getAllInterviews() {
        List<InterviewDto> interviews = interviewService.getAllInterviews();
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewDto> getInterviewById(@PathVariable Long id) {
        InterviewDto interview = interviewService.getInterviewById(id);
        return ResponseEntity.ok(interview);
    }

    @GetMapping("/interviewer/{interviewerId}")
    public ResponseEntity<List<InterviewDto>> getInterviewsByInterviewer(@PathVariable Long interviewerId) {
        List<InterviewDto> interviews = interviewService.getInterviewsByInterviewer(interviewerId);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<InterviewDto>> getInterviewsByCandidate(@PathVariable Long candidateId) {
        List<InterviewDto> interviews = interviewService.getInterviewsByCandidate(candidateId);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<InterviewDto>> getInterviewsByDate(@PathVariable LocalDate date) {
        List<InterviewDto> interviews = interviewService.getInterviewsByDate(date);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<InterviewDto>> getInterviewsByStatus(@PathVariable String status) {
        List<InterviewDto> interviews = interviewService.getInterviewsByStatus(status);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/today")
    public ResponseEntity<List<InterviewDto>> getTodayInterviews() {
        List<InterviewDto> interviews = interviewService.getTodayInterviews();
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/today/count")
    public ResponseEntity<Long> getTodayInterviewsCount() {
        List<InterviewDto> interviews = interviewService.getTodayInterviews();
        return ResponseEntity.ok((long) interviews.size());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<InterviewDto>> getUpcomingInterviews() {
        List<InterviewDto> interviews = interviewService.getUpcomingInterviews();
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/round/{round}")
    public ResponseEntity<List<InterviewDto>> getInterviewsByRound(@PathVariable String round) {
        List<InterviewDto> interviews = interviewService.getInterviewsByRound(round);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<InterviewDto>> getAssignedInterviews() {
        List<InterviewDto> interviews = interviewService.getInterviewsByStatus("SCHEDULED");
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/completed")
    public ResponseEntity<List<InterviewDto>> getCompletedInterviews() {
        List<InterviewDto> interviews = interviewService.getInterviewsByStatus("COMPLETED");
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<InterviewDto>> getPendingInterviews() {
        List<InterviewDto> interviews = interviewService.getInterviewsByStatus("PENDING_FEEDBACK");
        return ResponseEntity.ok(interviews);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelInterview(@PathVariable Long id) {
        interviewService.cancelInterview(id);
        return ResponseEntity.ok("Interview cancelled successfully");
    }    
}