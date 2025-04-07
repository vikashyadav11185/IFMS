package com.nucleusteq.ifms.mapper;

import com.nucleusteq.ifms.dto.InterviewDto;
import com.nucleusteq.ifms.model.Interview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface InterviewMapper {
    InterviewMapper INSTANCE = Mappers.getMapper(InterviewMapper.class);
    
    @Mapping(source = "candidate.id", target = "candidateId")
    @Mapping(source = "candidate.name", target = "candidateName")
    @Mapping(source = "candidate.email", target = "candidateEmail")
    @Mapping(source = "candidate.roleApplied", target = "candidateRole")
    @Mapping(source = "interviewer.id", target = "interviewerId")
    @Mapping(source = "interviewer.fullName", target = "interviewerName") // Changed from name to fullName
    InterviewDto toDto(Interview interview);
    
    @Mapping(target = "candidate", ignore = true)
    @Mapping(target = "interviewer", ignore = true)
    @Mapping(target = "round", expression = "java(com.nucleusteq.ifms.model.InterviewRound.valueOf(interviewDto.getRound().toUpperCase()))")
    Interview toEntity(InterviewDto interviewDto);
}