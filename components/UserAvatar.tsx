/**
 * UserAvatar - Legacy Compatibility Wrapper
 * 
 * This component is now a simple wrapper around EnhancedAvatar
 * to maintain backward compatibility while using the new robust system.
 * 
 * @deprecated Use EnhancedAvatar directly for new code
 */

import React from 'react';
import { User } from '../store/userStore';
import EnhancedAvatar from './EnhancedAvatar';

interface UserAvatarProps {
  user: User | null | undefined;
  size?: 'small' | 'medium' | 'large' | 'xl' | 'xxl';
  variant?: 'circle' | 'rounded';
  style?: any;
}

/**
 * @deprecated Use EnhancedAvatar directly for new code
 * This wrapper maintains backward compatibility with existing code
 */
const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'medium', 
  variant = 'circle',
  style = {}
}) => {
  // Map old size names to new size names
  const sizeMap = {
    'small': 'sm' as const,
    'medium': 'md' as const,
    'large': 'lg' as const,
    'xl': 'xl' as const,
    'xxl': 'xxl' as const
  };

  return (
    <EnhancedAvatar 
      user={user}
      size={sizeMap[size]}
      variant={variant}
      style={style}
    />
  );
};

export default UserAvatar;
