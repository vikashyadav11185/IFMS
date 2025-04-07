package com.nucleusteq.ifms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.nucleusteq.ifms.service.UsersDetailsService;

import java.io.IOException;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	@Autowired
	private JwtTokenProvider jwtService;
	
	@Autowired
	ApplicationContext context;
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		 String authHeader=request.getHeader("Authorization");
		 System.out.print("Yeah Auth vala "+authHeader);		
		 String token="";
		 String email=null;
		  
		 if(authHeader != null && authHeader.startsWith("Bearer ")) {
			 token =authHeader.substring(7);
			 email=jwtService.extractUserName(token);
			
		 }
		 
		 if(email != null && SecurityContextHolder.getContext().getAuthentication()==null) {
			   
			 UserDetails userDetails = context.getBean(UsersDetailsService.class).loadUserByUsername(email);
			 
			 if(jwtService.validateToken(token,userDetails)) {
				 UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
				 authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
				 SecurityContextHolder.getContext().setAuthentication(authToken);
			 }
			 
		 }
		 filterChain.doFilter(request, response);
		
	}

}