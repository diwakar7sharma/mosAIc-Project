import React from 'react';

const SpeechWaveAnimation: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-1">
      <div className="w-1 h-8 bg-primary rounded-full speech-wave"></div>
      <div className="w-1 h-6 bg-primary rounded-full speech-wave"></div>
      <div className="w-1 h-10 bg-primary rounded-full speech-wave"></div>
      <div className="w-1 h-4 bg-primary rounded-full speech-wave"></div>
      <div className="w-1 h-8 bg-primary rounded-full speech-wave"></div>
      <div className="w-1 h-6 bg-primary rounded-full speech-wave"></div>
      <div className="w-1 h-12 bg-primary rounded-full speech-wave"></div>
      <div className="w-1 h-4 bg-primary rounded-full speech-wave"></div>
    </div>
  );
};

export default SpeechWaveAnimation;
