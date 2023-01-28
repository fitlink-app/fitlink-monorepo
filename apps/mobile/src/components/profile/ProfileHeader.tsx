import React, {FC} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

import {useGoals} from '@hooks';
import {calculateGoalsPercentage} from '@utils';
import {SCREEN_CONTAINER_SPACE} from '@constants';
import {GoalTracker, UserWidget} from '@components';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {PrivacySetting} from '@fitlink/api/src/modules/users-settings/users-settings.constants';

interface IProfileHeaderProps {
  user: User | undefined;
  wrapperStyle?: StyleProp<ViewStyle>;
  isLocalUser?: boolean;
  showGoals?: boolean;
}

const ProfileHeaderInner: FC<IProfileHeaderProps> = ({
  user,
  wrapperStyle,
  isLocalUser = true,
  showGoals = true,
}) => {
  // TODO: need API that accepts user id
  const {data: goals} = useGoals();

  if (!user) {
    return null;
  }

  const shouldRenderGoals = () => {
    if (isLocalUser) {
      return true;
    }
    // @ts-ignore
    switch (user?.privacy_daily_statistics) {
      case PrivacySetting.Public:
        return true;
      case PrivacySetting.Private:
        return false;
      case PrivacySetting.Following:
        return user.following;
      default:
        return false;
    }
  };

  return (
    <View style={wrapperStyle}>
      <UserWidget
        goalProgress={goals ? calculateGoalsPercentage(goals) : 0}
        name={user.name}
        rank={user.rank}
        avatar={user.avatar?.url_512x512}
        friendCount={user.following_total}
        followerCount={user.followers_total}
        pointCount={user.points_total}
        containerStyle={{marginBottom: SCREEN_CONTAINER_SPACE}}
      />
      {showGoals && shouldRenderGoals() && (
        <GoalTracker
          isLocalUser={isLocalUser}
          containerStyle={{marginBottom: SCREEN_CONTAINER_SPACE - 10}}
        />
      )}
    </View>
  );
};

export const ProfileHeader = React.memo(ProfileHeaderInner);

export default ProfileHeader;
