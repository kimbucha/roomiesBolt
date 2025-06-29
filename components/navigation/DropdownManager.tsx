import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

// Create a context to manage which dropdown is open
type DropdownContextType = {
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
};

const DropdownContext = createContext<DropdownContextType>({
  activeDropdown: null,
  setActiveDropdown: () => {},
});

// Hook to access the dropdown context
export const useDropdownManager = () => useContext(DropdownContext);

interface DropdownManagerProps {
  children: ReactNode;
}

export const DropdownManager: React.FC<DropdownManagerProps> = ({ children }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <DropdownContext.Provider value={{ 
      activeDropdown, 
      setActiveDropdown
    }}>
      <View style={styles.container}>
        {children}
      </View>
    </DropdownContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DropdownManager;
