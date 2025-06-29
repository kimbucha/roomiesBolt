import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface InlineCalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
}

const InlineCalendar: React.FC<InlineCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate = new Date()
}) => {
  // Initialize currentMonth properly - avoid invalid dates
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Always start with current date as fallback
    const now = new Date();
    
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Update currentMonth when selectedDate changes
  useEffect(() => {
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);
  
  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    // Ensure currentMonth is valid
    if (!currentMonth || isNaN(currentMonth.getTime())) {
      console.warn('[InlineCalendar] Invalid currentMonth, using current date');
      const now = new Date();
      setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
      return [];
    }
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Validate year and month
    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      console.warn('[InlineCalendar] Invalid year or month', { year, month });
      return [];
    }
    
    // First day of the month and how many days in the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 = Sunday
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentMonth]);
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      if (!prev || isNaN(prev.getTime())) {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() - 1, 1);
      }
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (!prev || isNaN(prev.getTime())) {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });
  };
  
  // Check if a date is selectable (not before today)
  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate >= today;
  };
  
  // Check if a date is selected
  const isDateSelected = (date: Date) => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // Ensure we have a valid currentMonth for display
  const displayMonth = currentMonth && !isNaN(currentMonth.getTime()) ? currentMonth : new Date();
  const monthIndex = displayMonth.getMonth();
  const year = displayMonth.getFullYear();
  
  // Validate month index
  const safeMonthIndex = monthIndex >= 0 && monthIndex <= 11 ? monthIndex : new Date().getMonth();
  
  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8,
      padding: 6,
    }}>
      {/* Month/Year Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
      }}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={{
            padding: 6,
            borderRadius: 4,
            backgroundColor: '#F3F4F6',
          }}
        >
          <ChevronLeft size={16} color="#6B7280" />
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 15,
          fontWeight: '600',
          color: '#111827',
        }}>
          {monthNames[safeMonthIndex]} {year}
        </Text>
        
        <TouchableOpacity
          onPress={goToNextMonth}
          style={{
            padding: 6,
            borderRadius: 4,
            backgroundColor: '#F3F4F6',
          }}
        >
          <ChevronRight size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      {/* Day names header */}
      <View style={{
        flexDirection: 'row',
        marginBottom: 4,
      }}>
        {dayNames.map(day => (
          <View key={day} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{
              fontSize: 9,
              fontWeight: '500',
              color: '#6B7280',
            }}>
              {day}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Calendar grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {calendarDays.length > 0 ? calendarDays.map((date, index) => {
          if (!date) {
            // Empty cell
            return (
              <View
                key={`empty-${index}`}
                style={{
                  width: '14.28%', // 100% / 7 days
                  aspectRatio: 1.1, // Increased from 0.6 to make calendar more compact overall
                  padding: 0,
                }}
              />
            );
          }
          
          const selectable = isDateSelectable(date);
          const selected = isDateSelected(date);
          
          return (
            <TouchableOpacity
              key={date.toISOString()}
              onPress={() => selectable && onDateSelect(date)}
              disabled={!selectable}
              style={{
                width: '14.28%', // 100% / 7 days
                aspectRatio: 1.1, // Increased from 0.6 to make calendar more compact overall
                padding: 0,
              }}
            >
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 3,
                backgroundColor: selected ? '#4F46E5' : 'transparent',
                opacity: selectable ? 1 : 0.3,
                margin: selected ? 3 : 0,
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: selected ? '600' : '500',
                  color: selected ? '#FFFFFF' : selectable ? '#111827' : '#9CA3AF',
                }}>
                  {date.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }) : (
          <View style={{ 
            width: '100%', 
            paddingVertical: 15, 
            alignItems: 'center' 
          }}>
            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
              Unable to load calendar
            </Text>
          </View>
        )}
      </View>
      
      {/* Helper text */}
      <Text style={{
        fontSize: 9,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 4,
        paddingBottom: 2,
      }}>
        Select your available move-in date
      </Text>
    </View>
  );
};

export default InlineCalendar; 