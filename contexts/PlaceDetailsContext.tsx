import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AmenityType = 'parking' | 'gym' | 'pool' | 'ac' | 'furnished' | 'dishwasher' | 'in-unit-laundry' | 'pets' | 'balcony';

// Define the place details data structure
export interface PlaceDetailsData {
  roomType?: 'private' | 'shared' | 'studio';
  bedrooms: number;
  bathrooms: number;
  monthlyRent?: string;
  address?: string;
  moveInDate?: string;
  leaseDuration?: string;
  utilitiesIncluded?: boolean;
  estimatedUtilitiesCost?: string;
  utilities?: Array<{
    id: string;
    name: string;
    status: 'included' | 'not-included' | 'estimated';
    estimatedCost?: string;
  }>;
  amenities: AmenityType[];
  photos: string[];
  description?: string;
}

// Define the context interface
interface PlaceDetailsContextType {
  placeDetails: PlaceDetailsData;
  currentStep: number;
  updatePlaceDetails: (updates: Partial<PlaceDetailsData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  isStepComplete: (step: number) => boolean;
}

// Create the context
const PlaceDetailsContext = createContext<PlaceDetailsContextType | undefined>(undefined);

// Initial state
const initialPlaceDetails: PlaceDetailsData = {
  bedrooms: 1,
  bathrooms: 1,
  amenities: [],
  photos: [],
};

// Provider component
export const PlaceDetailsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetailsData>(initialPlaceDetails);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Total number of steps - updated to 5
  const totalSteps = 5;

  // Update place details
  const updatePlaceDetails = (updates: Partial<PlaceDetailsData>) => {
    setPlaceDetails(prev => ({ ...prev, ...updates }));
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  // Check if a step is complete
  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Information
        return Boolean(
          placeDetails.roomType && 
          placeDetails.monthlyRent && 
          placeDetails.address
        );
      case 2: // Availability & Lease Terms
        return Boolean(
          placeDetails.moveInDate && 
          placeDetails.leaseDuration
        );
      case 3: // Utilities
        // Since utilities have default selections and user can configure them,
        // this step should always be considered complete
        return true;
      case 4: // Amenities - Optional, always complete
        return true;
      case 5: // Photos & Description
        return placeDetails.photos.length > 0 && Boolean(placeDetails.description);
      default:
        return false;
    }
  };

  return (
    <PlaceDetailsContext.Provider
      value={{
        placeDetails,
        currentStep,
        updatePlaceDetails,
        nextStep,
        prevStep,
        goToStep,
        isStepComplete,
      }}
    >
      {children}
    </PlaceDetailsContext.Provider>
  );
};

// Custom hook to use the place details context
export const usePlaceDetails = () => {
  const context = useContext(PlaceDetailsContext);
  if (context === undefined) {
    throw new Error('usePlaceDetails must be used within a PlaceDetailsProvider');
  }
  return context;
};
