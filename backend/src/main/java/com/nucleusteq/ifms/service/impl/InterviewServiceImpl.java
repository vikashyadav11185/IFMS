package com.nucleusteq.ifms.service.impl;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.nucleusteq.ifms.dto.InterviewDto;
import com.nucleusteq.ifms.exception.ResourceNotFoundException;
import com.nucleusteq.ifms.mapper.InterviewMapper;
import com.nucleusteq.ifms.model.Candidate;
import com.nucleusteq.ifms.model.Interview;
import com.nucleusteq.ifms.model.InterviewRound;
import com.nucleusteq.ifms.model.InterviewStatus;
import com.nucleusteq.ifms.model.InterviewType;
import com.nucleusteq.ifms.model.User;
import com.nucleusteq.ifms.repository.CandidateRepository;
import com.nucleusteq.ifms.repository.InterviewRepository;
import com.nucleusteq.ifms.repository.UserRepository;
import com.nucleusteq.ifms.service.InterviewService;

import jakarta.transaction.Transactional;

@Service
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final InterviewMapper interviewMapper;

    public InterviewServiceImpl(InterviewRepository interviewRepository,
                              CandidateRepository candidateRepository,
                              UserRepository userRepository,
                              InterviewMapper interviewMapper) {
        this.interviewRepository = interviewRepository;
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
        this.interviewMapper = interviewMapper;
    }

    @Override
    public InterviewDto scheduleInterview(InterviewDto interviewDto) {
        // 1. Check if candidate exists
        Candidate candidate = candidateRepository.findById(interviewDto.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + interviewDto.getCandidateId()));

        // 2. Check if interviewer exists
        User interviewer = userRepository.findById(interviewDto.getInterviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Interviewer not found with id: " + interviewDto.getInterviewerId()));

        // 3. Convert String round to InterviewRound enum
        InterviewRound newRound;
        try {
            newRound = InterviewRound.valueOf(interviewDto.getRound().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid interview round: " + interviewDto.getRound());
        }

        // 4. Get all existing interviews for this candidate
        List<Interview> existingInterviews = interviewRepository.findByCandidateId(interviewDto.getCandidateId());

        // 5. Validate interview scheduling rules
        if (!existingInterviews.isEmpty()) {
            for (Interview existingInterview : existingInterviews) {
                // Skip if no feedback exists for the interview
                if (existingInterview.getFeedback() == null) {
                    continue;
                }

                String existingDecision = existingInterview.getFeedback().getDecision().name();

                // Case 1a: If previous decision was L1_PASSED and trying to schedule L2
                if (existingDecision.equals("L1_PASSED") && newRound == InterviewRound.L2) {
                    throw new RuntimeException("Cannot schedule L2 interview - candidate already passed L1 with no further evaluation needed");
                }

                // Case 1b: If previous decision was L1_REJECTED
                if (existingDecision.equals("L1_REJECTED")) {
                    throw new RuntimeException("Cannot schedule interview - candidate was already rejected in L1");
                }

                // Case 1c: If trying to schedule same round again
                if (existingInterview.getRound() == newRound) {
                    throw new RuntimeException("Candidate already has an interview scheduled for round " + newRound);
                }
            }
        }

        // 6. Check if interview already exists for this candidate and round
        if (interviewRepository.existsByCandidateIdAndRound(interviewDto.getCandidateId(), newRound)) {
            throw new RuntimeException("Interview already exists for this candidate and round!");
        }

        // 7. Basic time validations
        if (interviewDto.getDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Interview date cannot be in the past");
        }

        if (interviewDto.getTime().isBefore(LocalTime.of(9, 0))) {
            throw new RuntimeException("Interviews cannot be scheduled before 9:00 AM");
        }

        // 8. Create and save the interview
        Interview interview = interviewMapper.toEntity(interviewDto);
        interview.setCandidate(candidate);
        interview.setInterviewer(interviewer);
        interview.setRound(newRound); // Set the converted enum value
        interview.setStatus(InterviewStatus.SCHEDULED);

        Interview savedInterview = interviewRepository.save(interview);
        return interviewMapper.toDto(savedInterview);
    }

    @Override
    public InterviewDto updateInterview(Long id, InterviewDto interviewDto) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
        
        if (interviewDto.getCandidateId() != null) {
            Candidate candidate = candidateRepository.findById(interviewDto.getCandidateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + interviewDto.getCandidateId()));
            interview.setCandidate(candidate);
        }
        
        if (interviewDto.getInterviewerId() != null) {
            User interviewer = userRepository.findById(interviewDto.getInterviewerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Interviewer not found with id: " + interviewDto.getInterviewerId()));
            interview.setInterviewer(interviewer);
        }
        
        interview.setDate(interviewDto.getDate());
        interview.setTime(interviewDto.getTime());
        interview.setDuration(interviewDto.getDuration());
        interview.setType(InterviewType.valueOf(interviewDto.getType()));
        interview.setMeetingLink(interviewDto.getMeetingLink());
        interview.setNotes(interviewDto.getNotes());
        interview.setStatus(InterviewStatus.valueOf(interviewDto.getStatus()));
        
        Interview updatedInterview = interviewRepository.save(interview);
        return interviewMapper.toDto(updatedInterview);
    }

 // In InterviewServiceImpl.java
    @Override
    public List<InterviewDto> getAllInterviews() {
        List<InterviewDto> interviews = interviewRepository.findAll().stream()
                .map(interview -> {
                    InterviewDto dto = interviewMapper.toDto(interview);
                    if (interview.getCandidate() != null) {
                        dto.setCandidateRole(interview.getCandidate().getRoleApplied());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
        return interviews;
    }
    @Override
    public InterviewDto getInterviewById(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
        return interviewMapper.toDto(interview);
    }

    @Override
    @Transactional
    public void cancelInterview(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
        interview.setStatus(InterviewStatus.CANCELLED);
        interviewRepository.save(interview);
        interviewRepository.delete(interview);
    }

    @Override
    public List<InterviewDto> getInterviewsByInterviewer(Long interviewerId) {
        User interviewer = userRepository.findById(interviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Interviewer not found with id: " + interviewerId));
        
        return interviewRepository.findByInterviewer(interviewer).stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<InterviewDto> getInterviewsByCandidate(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with id: " + candidateId));
        
        return interviewRepository.findByCandidateId(candidateId).stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<InterviewDto> getInterviewsByDate(LocalDate date) {
        return interviewRepository.findByDate(date).stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<InterviewDto> getInterviewsByStatus(String status) {
        return interviewRepository.findByStatus(status).stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<InterviewDto> getTodayInterviews() {
        return interviewRepository.findByDate(LocalDate.now()).stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<InterviewDto> getUpcomingInterviews() {
        return interviewRepository.findByDateAfter(LocalDate.now()).stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<InterviewDto> getInterviewsByRound(String round) {
        return interviewRepository.findByRound(round).stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }

	@Override
	public List<InterviewDto> getPastInterviews() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<InterviewDto> getInterviewsBetweenDates(LocalDate startDate, LocalDate endDate) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<InterviewDto> getUpcomingInterviewsSorted() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public long getInterviewCountByStatus(String status) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public List<InterviewDto> getUpcomingInterviewsByInterviewer(Long interviewerId) {
		// TODO Auto-generated method stub
		return null;
	}
	
}