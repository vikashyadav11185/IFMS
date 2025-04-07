package com.nucleusteq.ifms.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.nucleusteq.ifms.exception.ResourceNotFoundException;
import com.nucleusteq.ifms.model.Interviewer;
import com.nucleusteq.ifms.model.Position;
import com.nucleusteq.ifms.repository.InterviewerRepository;
import com.nucleusteq.ifms.service.InterviewerService;

@Service
public class InterviewerServiceImpl implements InterviewerService {

    private final InterviewerRepository interviewerRepository;

    public InterviewerServiceImpl(InterviewerRepository interviewerRepository) {
        this.interviewerRepository = interviewerRepository;
    }

    @Override
    public List<Interviewer> getAllInterviewers() {
        return interviewerRepository.findAll();
    }

    @Override
    public Interviewer getInterviewerById(Long id) {
        return interviewerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interviewer not found with id: " + id));
    }

    @Override
    public Interviewer getInterviewerByEmail(String email) {
        return interviewerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Interviewer not found with email: " + email));
    }

    @Override
    public List<Interviewer> getInterviewersByPosition(Position position) {
        return interviewerRepository.findByPosition(position);
    }
}