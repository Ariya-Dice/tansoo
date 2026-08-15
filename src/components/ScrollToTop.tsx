import { useEffect, useRef } from 'react';
import {
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();

  const isFirstRender = useRef(true);

  useEffect(() => {
    /*
     * اولین بار که برنامه باز می‌شود:
     * اجازه می‌دهیم مرورگر موقعیت فعلی را مدیریت کند.
     */
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    /*
     * POP یعنی:
     * Back یا Forward مرورگر
     *
     * در این حالت موقعیت قبلی صفحه را حفظ می‌کنیم.
     */
    if (navigationType === 'POP') {
      return;
    }

    /*
     * PUSH / REPLACE یعنی ورود به یک صفحه جدید.
     * صفحه جدید باید از بالای صفحه نمایش داده شود.
     */
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  }, [pathname, key, navigationType]);

  return null;
};

export default ScrollToTop;