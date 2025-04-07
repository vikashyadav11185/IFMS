package com.nucleusteq.ifms.controller;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nucleusteq.ifms.dto.InterviewerDto;
import com.nucleusteq.ifms.exception.ResourceNotFoundException;
import com.nucleusteq.ifms.mapper.InterviewerMapper;
import com.nucleusteq.ifms.model.Interviewer;
import com.nucleusteq.ifms.model.Position;
import com.nucleusteq.ifms.service.InterviewerService;

@RestController
@RequestMapping("/api/interviewers")
public class InterviewerController {

    private final InterviewerService interviewerService;
    private final InterviewerMapper interviewerMapper;

    public InterviewerController(InterviewerService interviewerService, 
                               InterviewerMapper interviewerMapper) {
        this.interviewerService = interviewerService;
        this.interviewerMapper = interviewerMapper;
    }

    @GetMapping
    public ResponseEntity<List<InterviewerDto>> getAllInterviewers() {
        List<InterviewerDto> interviewers = interviewerService.getAllInterviewers()
                .stream()
                .map(interviewerMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(interviewers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewerDto> getInterviewerById(@PathVariable Long id) {
        InterviewerDto interviewer = interviewerMapper.toDto(
                interviewerService.getInterviewerById(id));
        return ResponseEntity.ok(interviewer);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<InterviewerDto> getInterviewerByEmail(@PathVariable String email) {
        InterviewerDto interviewer = interviewerMapper.toDto(
                interviewerService.getInterviewerByEmail(email));
        return ResponseEntity.ok(interviewer);
    }

    @GetMapping("/position/{position}")
    public ResponseEntity<List<InterviewerDto>> getInterviewersByPosition(
            @PathVariable Position position) {
        List<InterviewerDto> interviewers = interviewerService.getInterviewersByPosition(position)
                .stream()
                .map(interviewerMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(interviewers);
    }
}