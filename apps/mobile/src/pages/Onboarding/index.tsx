import React, {useEffect, useRef, useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import PagerView from 'react-native-pager-view';
import {ActivityIndicator, Image} from 'react-native';
import {BasicInfo, Goals} from './subscreens';
import {Button, Dots} from '@components';
import {useMe} from '@hooks';
import {useDispatch, useSelector} from 'react-redux';
import {
  clearChanges,
  selectSettings,
  setState,
} from 'redux/settings/settingsSlice';
import {AppDispatch} from 'redux/store';
import {UnitSystem} from '@fitlink/api/src/modules/users/users.constants';
import {Trackers} from './subscreens/Trackers';
import {Privacy} from './subscreens/Privacy';
import {Navigation} from './components';
import {logout} from 'redux/auth/authSlice';

const BACKGROUND_IMAGE = require('../../../../assets/images/BackgroundOnboarding.png');

const Wrapper = styled.View({flex: 1});

const BackgroundImageContainer = styled.View({
  position: 'absolute',
  alignItems: 'flex-end',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  zIndex: -1,
});

const StyledPager = styled(PagerView)({flex: 1});

const ButtonContainer = styled.View({
  alignItems: 'center',
  marginBottom: 25,
  paddingHorizontal: 20,
});

const LoadingContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const BackButtonWrapper = styled.View({
  height: 44,
});

enum OnboardingPages {
  BasicInfo = 0,
  Goals = 1,
  Trackers = 2,
  Privacy = 3,
}

export const Onboarding = () => {
  const dispatch = useDispatch() as AppDispatch;
  const {colors} = useTheme();

  // queries
  const {data: user} = useMe();

  // redux
  const settings = useSelector(selectSettings);

  // local state
  const [isInitialized, setInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState<OnboardingPages>(0);

  // refs
  const viewPagerRef = useRef<PagerView>(null);
  const navEnabled = useRef(true);

  const slides = [
    <BasicInfo key={OnboardingPages.BasicInfo} />,
    <Goals key={OnboardingPages.Goals} />,
    <Trackers />,
    <Privacy />,
  ];

  useEffect(() => {
    if (user && !isInitialized) {
      dispatch(clearChanges());

      dispatch(
        setState({
          name: user?.name || '',
          unitSystem: user?.unit_system || UnitSystem.Imperial,
          timezone: user.timezone,
          avatar: user.avatar,
          goals: {
            goal_mindfulness_minutes: user?.goal_mindfulness_minutes || 2,
            goal_steps: user?.goal_steps || 500,
            goal_floors_climbed: user?.goal_floors_climbed || 15,
            goal_water_litres: user?.goal_water_litres || 2.5,
            goal_sleep_hours: user?.goal_sleep_hours || 8,
          },
        }),
      );

      setInitialized(true);
    }
  }, [user]);

  const setPage = (page: number) => {
    if (!viewPagerRef?.current || !navEnabled.current) return;

    if (page >= 0 && page < slides.length) {
      setCurrentPage(page);
      viewPagerRef.current.setPage(page);
      navEnabled.current = false;
    }
  };

  // invoked when the pager finishes animating to a screen
  const handlePageSelected = () => {
    navEnabled.current = true;
  };

  const handleNextPressed = () => {
    // switch
    setPage(currentPage + 1);
  };

  const handleBackPressed = () => {
    setPage(currentPage - 1);
  };

  const isContinueEnabled = () => {
    switch (currentPage) {
      case OnboardingPages.BasicInfo:
        return settings.name?.length >= 3;

      case OnboardingPages.Goals:
        return true;

      case OnboardingPages.Trackers:
        return true;

      case OnboardingPages.Privacy:
        return true;

      default:
        return false;
    }
  };

  const isBackEnabled = () => {
    switch (currentPage) {
      case OnboardingPages.BasicInfo:
        return false;

      default:
        return true;
    }
  };

  return (
    <Wrapper>
      {isInitialized ? (
        <>
          <Navigation
            backEnabled={isBackEnabled()}
            onBack={() => setPage(currentPage - 1)}
            onLogout={() => {
              dispatch(logout());
            }}
          />
          <StyledPager
            onPageSelected={handlePageSelected}
            scrollEnabled={false}
            ref={viewPagerRef}>
            {slides}
          </StyledPager>
          <Dots
            style={{marginBottom: 20, marginTop: 5}}
            amount={slides.length}
            current={currentPage}
          />
          <ButtonContainer>
            <Button
              text={
                currentPage === OnboardingPages.Privacy ? 'Finish' : 'Continue'
              }
              onPress={handleNextPressed}
              disabled={!isContinueEnabled()}
            />

            <BackButtonWrapper>
              {isBackEnabled() && (
                <Button
                  style={{marginTop: 5}}
                  textOnly
                  text={'Go back'}
                  onPress={handleBackPressed}
                />
              )}
            </BackButtonWrapper>
          </ButtonContainer>
        </>
      ) : (
        <LoadingContainer>
          <ActivityIndicator color={colors.accent} />
        </LoadingContainer>
      )}

      <BackgroundImageContainer>
        <Image
          source={BACKGROUND_IMAGE}
          style={{
            right: -130,
            bottom: -40,
          }}
        />
      </BackgroundImageContainer>
    </Wrapper>
  );
};
