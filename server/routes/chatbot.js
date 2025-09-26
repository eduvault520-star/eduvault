const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/chatbot/query
// @desc    Send query to AI chatbot
// @access  Private
router.post('/query', [
  auth,
  body('message').trim().isLength({ min: 1, max: 1000 }),
  body('context').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, context } = req.body;

    // Prepare context for the AI
    let systemPrompt = `You are an educational assistant for EduVault, a platform for Kenyan higher education students. 
    You help students with:
    1. Explaining academic concepts and topics
    2. Creating quizzes and practice questions
    3. Study tips and learning strategies
    4. Course-related questions
    
    Keep responses concise, educational, and relevant to Kenyan higher education context.
    If asked to create a quiz, format it clearly with numbered questions and multiple choice options where appropriate.`;

    if (context) {
      if (context.course) systemPrompt += `\nStudent's course: ${context.course}`;
      if (context.year) systemPrompt += `\nStudent's year: ${context.year}`;
      if (context.unit) systemPrompt += `\nCurrent unit: ${context.unit}`;
    }

    try {
      // Call to xAI Grok API (or fallback to OpenAI-compatible API)
      const response = await axios.post(process.env.GROK_API_URL || 'https://api.openai.com/v1/chat/completions', {
        model: 'grok-beta', // or 'gpt-3.5-turbo' for fallback
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.GROK_API_KEY || process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;

      res.json({
        message: aiResponse,
        timestamp: new Date().toISOString()
      });

    } catch (aiError) {
      console.error('AI API error:', aiError);
      
      // Fallback response if AI service is unavailable
      let fallbackResponse = "I'm currently unable to connect to the AI service. ";
      
      if (message.toLowerCase().includes('quiz')) {
        fallbackResponse += "For quiz creation, try breaking down your topic into key concepts and create questions around those areas.";
      } else if (message.toLowerCase().includes('explain')) {
        fallbackResponse += "For explanations, I recommend checking your course materials or consulting with your lecturers.";
      } else {
        fallbackResponse += "Please try again later or consult your course materials for assistance.";
      }

      res.json({
        message: fallbackResponse,
        timestamp: new Date().toISOString(),
        isFailover: true
      });
    }

  } catch (error) {
    console.error('Chatbot query error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chatbot/quiz
// @desc    Generate quiz for specific topic
// @access  Private
router.post('/quiz', [
  auth,
  body('topic').trim().isLength({ min: 2, max: 200 }),
  body('questionCount').isInt({ min: 1, max: 10 }),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { topic, questionCount, difficulty = 'medium' } = req.body;

    const quizPrompt = `Create a ${difficulty} level quiz about "${topic}" with exactly ${questionCount} multiple choice questions. 
    Format each question as:
    Q1: [Question text]
    A) [Option A]
    B) [Option B] 
    C) [Option C]
    D) [Option D]
    Correct Answer: [Letter]
    
    Make questions relevant to Kenyan higher education context where applicable.`;

    try {
      const response = await axios.post(process.env.GROK_API_URL || 'https://api.openai.com/v1/chat/completions', {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are an educational quiz generator for Kenyan higher education students.'
          },
          {
            role: 'user',
            content: quizPrompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.GROK_API_KEY || process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const quiz = response.data.choices[0].message.content;

      res.json({
        quiz,
        topic,
        questionCount,
        difficulty,
        timestamp: new Date().toISOString()
      });

    } catch (aiError) {
      console.error('Quiz generation error:', aiError);
      
      // Fallback quiz template
      const fallbackQuiz = `Quiz on ${topic}

Q1: What is the main concept related to ${topic}?
A) Option A
B) Option B
C) Option C
D) Option D
Correct Answer: C

Please note: AI service is currently unavailable. This is a template quiz. For better quizzes, please try again later.`;

      res.json({
        quiz: fallbackQuiz,
        topic,
        questionCount,
        difficulty,
        timestamp: new Date().toISOString(),
        isFailover: true
      });
    }

  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chatbot/suggestions
// @desc    Get suggested questions/topics
// @access  Private
router.get('/suggestions', auth, async (req, res) => {
  try {
    const { course, unit } = req.query;

    // Predefined suggestions based on common Kenyan higher education topics
    let suggestions = [
      "Explain the concept of...",
      "Create a 5-question quiz on...",
      "What are the key points about...?",
      "How do I study for...?",
      "Give me practice questions for...",
      "Summarize the main ideas of...",
      "What are the applications of...?",
      "Compare and contrast...",
      "Define the following terms...",
      "Explain with examples..."
    ];

    // Add course-specific suggestions if available
    if (course) {
      suggestions.unshift(
        `Explain key concepts in ${course}`,
        `Create a quiz for ${course}`,
        `Study tips for ${course}`
      );
    }

    if (unit) {
      suggestions.unshift(
        `Explain ${unit} concepts`,
        `Quiz me on ${unit}`,
        `${unit} practice questions`
      );
    }

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
