import {BannerCard, IBannerCardProps} from '@components';
import React, {FC} from 'react';
import {SCREEN_CONTAINER_SPACE} from '@constants';

type LeaguesTipBannerCardProps = Omit<
  IBannerCardProps,
  'title' | 'p1' | 'p2' | 'style'
>;

export const LeaguesTipBannerCard: FC<LeaguesTipBannerCardProps> = props => (
  <BannerCard
    {...props}
    title="WELCOME to leagues"
    p1="You can only join 3 Compete to Earn leagues, each being a different activity type."
    p2="For example, you can join one run league, swim league, and cycle league. That’s it. To join other Compete to Earn leagues, you’ll need to leave one to join another."
    style={{marginHorizontal: 20, marginBottom: SCREEN_CONTAINER_SPACE}}
  />
);
