import React, { createContext, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';

// Tạo context quản lý navigation
const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const navigation = useNavigation();
  return (
    <NavigationContext.Provider value={navigation}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useAppNavigation = () => {
  return useContext(NavigationContext);
};
