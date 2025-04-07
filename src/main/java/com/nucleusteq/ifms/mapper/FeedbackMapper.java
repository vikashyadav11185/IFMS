package com.nucleusteq.ifms.mapper;

import com.nucleusteq.ifms.dto.FeedbackDto;
import com.nucleusteq.ifms.model.Feedback;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {InterviewMapper.class})
public interface FeedbackMapper {
    FeedbackMapper INSTANCE = Mappers.getMapper(FeedbackMapper.class);
    
    @Mapping(source = "interview.id", target = "interviewId")
    @Mapping(source = "interview.candidate.name", target = "candidateName")
    @Mapping(source = "interview.candidate.email", target = "candidateEmail")
    @Mapping(source = "interview.candidate.roleApplied", target = "candidateRole")
    @Mapping(source = "interview.date", target = "interviewDate")
    @Mapping(source = "interview.interviewer.fullName", target = "interviewerName")
    FeedbackDto toDto(Feedback feedback);
    
    @Mapping(target = "interview", ignore = true)
    Feedback toEntity(FeedbackDto feedbackDto);
}