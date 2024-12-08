import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <DotLottieReact
          src="https://lottie.host/e88f16bb-4a60-438e-8d9a-77efc7c5777b/w539cfnBA5.lottie"
          loop
          autoplay
          style={{ width: '200px', height: '200px' }}
        />
        <p className="mt-4 text-lg text-gray-600">Loading amazing opportunities...</p>
      </div>
    </div>
  );
};

export default Loading;
