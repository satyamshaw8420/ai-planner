import React, { useState, useEffect } from 'react';

const TypingText = () => {
  const texts = [
    "Create personalized travel itineraries powered by AI. Discover destinations, plan activities, and make unforgettable memories.",
    "Experience seamless trip planning with real-time weather integration and smart recommendations.",
    "Let AI craft your perfect journey with customized suggestions and interactive maps.",
    "Plan smarter, travel better. Your AI-powered trip guide is just one tap away.",
    "From exploring new places to organizing every detail, your next adventure starts here.",
    "Skip the stress. AI handles the planning while you enjoy the journey.",
    "Explore the world with itineraries crafted in seconds, tailored just for you.",
    "One platform. Every destination. Infinite possibilities.",
    "Turn travel dreams into real plans with intelligent suggestions and live updates.",
    "Your perfect trip, curated with precision and a little AI magic.",
 "Navigate your adventures with personalized routes, real-time data, and zero hassle.",
 "Travel planning that actually feels fun. Let AI do the heavy lifting."
  ];
  
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(50);

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % texts.length;
      const fullText = texts[i];

      setCurrentText(isDeleting 
        ? fullText.substring(0, currentText.length - 1)
        : fullText.substring(0, currentText.length + 1)
      );

      setTypingSpeed(isDeleting ? 30 : 100);

      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setCurrentTextIndex((currentTextIndex + 1) % texts.length);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, loopNum, texts, typingSpeed, currentTextIndex]);

  return (
    <p className="text-orange-400 font-bold m-0">
      {currentText}
      <span className="animate-pulse">|</span>
    </p>
  );
};

export default TypingText;