import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAppStore from '../store/appStore';
import { ThemeToggle } from '../components/shared';
import blueShape from '../assets/blue.svg';
import pinkShape from '../assets/pink.svg';
import greenShape from '../assets/green.svg';
import yellowShape from '../assets/yellow.svg';
import orangeShape from '../assets/orange.svg';
import glassShape from '../assets/Glass.svg';
import dotgridShape from '../assets/dotgrid.svg';
import atIcon from '../assets/at.png';
import loginIcon from '../assets/out.png';
import flashlightIcon from '../assets/flashlight_on.png'; 

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, login } = useAppStore();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.5) {
        navigate('/diary-input');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  const handleLogin = () => {
    login('journaler');
    navigate('/diary-input');
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 font-sans">
      {/* Main Landing Section */}
      <div className="h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ paddingBottom: '15vh' }}>

            {/* Floating Background Shapes - Framer Motion Animations */}
      {/* Blue - top right area */}
      <motion.img 
        src={blueShape} 
        alt="" 
        className="absolute opacity-80" 
        style={{ 
          top: '-200px',
          right: '-50px',
          width: '650px', 
          height: '650px',
        }}
        animate={{
          x: [0, -150, -300, -150, 0],
          y: [0, 150, 0, -150, 0],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Pink - bottom left area */}
      <motion.img 
        src={pinkShape} 
        alt="" 
        className="absolute opacity-70" 
        style={{ 
          bottom: '-150px',
          left: '20px',
          width: '800px', 
          height: '800px',
        }}
        animate={{
          x: [0, 150, 300, 150, 0],
          y: [0, -100, 0, 100, 0],
          rotate: [0, -90, -180, -270, -360],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Green - upper left */}
      <motion.img 
        src={greenShape} 
        alt="" 
        className="absolute opacity-75" 
        style={{ 
          top: '-450px',
          left: '-200px',
          width: '900px', 
          height: '900px',
        }}
        animate={{
          x: [0, 100, 200, 100, 0],
          y: [0, 150, 300, 150, 0],
          rotate: [0, 60, 120, 180, 240, 300, 360],
        }}
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Yellow - lower right */}
      <motion.img 
        src={yellowShape} 
        alt="" 
        className="absolute opacity-80" 
        style={{ 
          bottom: '0px',
          right: '100px',
          width: '520px', 
          height: '520px',
        }}
        animate={{
          x: [0, -120, -240, -120, 0],
          y: [0, -80, -160, -80, 0],
          rotate: [0, -45, -90, -135, -180],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Orange - center-ish */}
      <motion.img 
        src={orangeShape} 
        alt="" 
        className="absolute opacity-60" 
        style={{ 
          top: '150px',
          left: '-100px',
          width: '320px', 
          height: '320px',
        }}
        animate={{
          x: [0, 180, 360, 180, 0],
          y: [0, 50, 100, 50, 0],
          rotate: [0, 180, 360, 180, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
      />

        {/* Dot Grid - positioned above the glass area */}
        <img src={dotgridShape} alt="" className="absolute pointer-events-none" 
          style={{ 
            bottom: '-420px', // Positioned right above the glass (glass height = 380px)
            left: '0px',
            width: '700px',
            height: '700px', // Dot grid height
            objectFit: 'cover',
            zIndex: 11,
            opacity: 1,
            filter: 'brightness(1.2)'
          }} 
        />

        {/* Second Dot Grid - positioned to the right of the first one */}
        <img src={dotgridShape} alt="" className="absolute pointer-events-none" 
          style={{ 
            bottom: '-420px', // Same as first dot grid
            left: '226.5px', // Starts where the first one ends (width of first = 700px)
            width: '700px',
            height: '700px',
            objectFit: 'cover',
            zIndex: 11,
            opacity: 1,
            filter: 'brightness(1.2)'
          }} 
        />

        {/* Glass overlay - glassmorphism effect */}
        <div className="absolute bottom-0 left-0 w-full pointer-events-none" 
          style={{ 
            height: '380px',
            zIndex: 10,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)', 
            background: 'rgba(255, 255, 255, 0.2)', 
            filter: 'brightness(1.05)'
          }}
        >
          {/* Glass SVG as overlay pattern */}
          <img src={glassShape} alt="" className="w-full h-full object-cover opacity-30 mix-blend-overlay animate-float" 
            style={{ 
              animationDelay: '0.5s',
            }} 
          />
        </div>



        {/* Brand Name */}
        <h1 className="text-8xl md:text-9xl lg:text-[10rem] font-mea-culpa text-gray-800 dark:text-white mb-8" style={{ fontFamily: '"Mea Culpa", cursive' }}>
          SIDE-B
        </h1>

        {/* Motto in Glassmorphism Button */}
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border border-white/50 dark:border-gray-700/50 text-gray-800 dark:text-white rounded-full px-8 py-3 font-light text-lg tracking-wide shadow-lg mb-8">
          Your day, one Song
        </div>

        {/* Scroll Indicator - chevron below motto */}
        <div className="animate-bounce">
          <svg
            className="w-10 h-10 text-black dark:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Action Buttons - positioned on first screen */}
        <div className="absolute bottom-8 right-8 flex items-center space-x-6 z-50">
          {/* Social Link */}
          <a
            href="#"
            className="hover:scale-110 transition-all"
            aria-label="Social"
          >
            <img src={atIcon} alt="Social" className="hover:scale-110 transition-all" style={{ width: '88px', height: '88px' }} />
          </a>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="hover:scale-110 transition-all"
            aria-label="Login"
          >
            <img src={loginIcon} alt="Login" style={{ width: '88px', height: '88px' }} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="hover:scale-110 transition-all"
            aria-label="Toggle theme"
          >
            <img src={flashlightIcon} alt="Toggle theme" style={{ width: '88px', height: '88px' }} />
          </button>
        </div>
      </div>

      {/* Second Section - makes page scrollable */}
      <div className="h-screen flex items-center justify-center">
        <div className="text-center opacity-0">
          {/* Hidden spacer to enable scrolling */}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
