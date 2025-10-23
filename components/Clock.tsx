import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <div className="text-center p-4 rounded-lg bg-[rgba(var(--color-bg-muted),0.3)] border border-[rgba(var(--color-border),0.2)] w-full sm:w-auto">
      <p className="text-4xl font-bold text-[rgb(var(--color-text-main))] tracking-wider">
        {time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
};

export default Clock;