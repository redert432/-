import { useState, useEffect } from 'react';

const useParallax = (strength: number = 20) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let hasDeviceOrientation = false;

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      // بمجرد اكتشاف حركة الجهاز، نتجاهل حركة الماوس
      if (!hasDeviceOrientation) {
          hasDeviceOrientation = true;
      }
      
      const { gamma, beta } = event; // gamma: يسار-يمين (-90 إلى 90), beta: أمام-خلف (-180 إلى 180)
      
      // تحديد قيمة beta في نطاق معقول مثل -90 إلى 90
      const cappedBeta = Math.max(-90, Math.min(90, beta ?? 0));

      const x = (gamma ?? 0) / 90 * strength;
      const y = cappedBeta / 90 * strength;

      setOffset({ x: -x, y: -y });
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      // لا تستخدم حركة الماوس إذا كانت حركة الجهاز متاحة
      if (hasDeviceOrientation) return;

      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;

      const x = (clientX - innerWidth / 2) / innerWidth * strength;
      const y = (clientY - innerHeight / 2) / innerHeight * strength;
      
      setOffset({ x: -x, y: -y });
    };
    
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [strength]);

  return offset;
};

export default useParallax;