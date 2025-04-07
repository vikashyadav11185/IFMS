package com.nucleusteq.ifms.config;

import com.nucleusteq.ifms.mapper.CandidateMapper;
import com.nucleusteq.ifms.mapper.FeedbackMapper;
import com.nucleusteq.ifms.mapper.InterviewMapper;
import org.mapstruct.factory.Mappers;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {
    
    @Bean
    public CandidateMapper candidateMapper() {
        return Mappers.getMapper(CandidateMapper.class);
    }
    
    @Bean
    public FeedbackMapper feedbackMapper() {
        return Mappers.getMapper(FeedbackMapper.class);
    }
    
    @Bean
    public InterviewMapper interviewMapper() {
        return Mappers.getMapper(InterviewMapper.class);
    }
}