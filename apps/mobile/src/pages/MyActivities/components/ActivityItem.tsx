import React from 'react';
import styled from 'styled-components/native';
import {Activity} from '@fitlink/api/src/modules/activities/entities/activity.entity';
import {ActivityType} from '@fitlink/api/src/modules/activities/activities.constants';
import {Label, TouchHandler} from '@components';
import {formatRelative} from 'date-fns';

const ActivityItemWrapper = styled(TouchHandler)({
  paddingHorizontal: 20,
  justifyContent: 'center',
  flex: 1,
});

const SpacedRow = styled.View({
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const VerticalSpacer = styled.View({height: 5});

export const ActivityItem = ({
  item,
  onPress,
}: {
  item: Activity;
  onPress: () => void;
}) => {
  function getTypeString(type: ActivityType): string {
    switch (type) {
      case ActivityType.Class:
        return 'Organised Class';

      case ActivityType.Group:
        return 'Group Activity';

      case ActivityType.Route:
        return 'Location';

      default:
        return '';
    }
  }

  return (
    <ActivityItemWrapper {...{onPress}}>
      <SpacedRow>
        <Label
          appearance={'primary'}
          type={'subheading'}
          style={{flexShrink: 1}}>
          {item.name}
        </Label>
        <Label appearance={'accentSecondary'}>
          {formatRelative(new Date(item.created_at), new Date())}
        </Label>
      </SpacedRow>

      <VerticalSpacer />

      <SpacedRow>
        <Label appearance={'accentSecondary'} style={{flexShrink: 1}}>
          {item.date}
        </Label>
        <Label appearance={'accent'}>{getTypeString(item.type)}</Label>
      </SpacedRow>
    </ActivityItemWrapper>
  );
};
