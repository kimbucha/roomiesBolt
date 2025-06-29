import React from 'react';
import { RoommateProfile } from '../../store/roommateStore';
import { DetailCard } from '../DetailCard';
import { RoommateMainContent } from './RoommateMainContent';
import { RoommateDetailContent } from './RoommateDetailContent';
import { RoommateHeaderContent } from './RoommateHeaderContent';

interface RoommateDetailCardProps {
  profile: RoommateProfile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperLike: () => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  id: string;
}

export const RoommateDetailCard: React.FC<RoommateDetailCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  expanded,
  onExpandedChange,
  id,
}) => {
  return (
    <DetailCard
      images={[profile.image]}
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      onSuperLike={onSuperLike}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      renderMainContent={() => <RoommateMainContent profile={profile} />}
      renderDetailContent={() => <RoommateDetailContent profile={profile} />}
      renderHeaderContent={() => <RoommateHeaderContent profile={profile} />}
      id={id}
      showDebugOverlay={__DEV__ && false} // Set to true to enable debug overlay during development
    />
  );
}; 