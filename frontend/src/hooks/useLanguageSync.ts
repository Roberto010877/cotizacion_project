import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAppTranslation } from '@/i18n/hooks';
import { updateLanguage } from '@/redux/authSlice';
import type { RootState } from '@/redux/store'; 
import axiosInstance from '@/lib/axios';

export const useLanguageSync = () => {
  const { i18n } = useAppTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleLanguageChange = async (lng: string) => {
      dispatch(updateLanguage(lng));
      
      if (user) {
        try {
          await axiosInstance.patch("/api/users/me/language/", { 
            language: lng 
          });
        } catch (error) {
          console.error("Error syncing language with backend:", error);
        }
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, dispatch, user]);

  useEffect(() => {
    if (user?.language && user.language !== i18n.language) {
      i18n.changeLanguage(user.language);
    }
  }, [user, i18n]);

  return { 
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage 
  };
};
