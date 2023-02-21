import React, {useEffect, useRef, useState} from 'react';
import PagerView from 'react-native-pager-view';
import {Image} from 'react-native';
import styled from 'styled-components/native';
import {useDispatch, useSelector} from 'react-redux';


import {Button, Dots, Logo, BfitSpinner} from '@components';
import {useJoinTeamByCode, useMe} from '@hooks';
import {
  clearChanges,
  selectIsSavingSettings,
  selectSettings,
  setState,
  submit,
} from 'redux/settings/settingsSlice';
import {AppDispatch} from 'redux/store';
import {UnitSystem} from '@fitlink/api/src/modules/users/users.constants';
import {Trackers, Privacy} from './subscreens';
import {Navigation} from './components';
import {logout} from 'redux/auth';
import {BasicInfo, Goals} from './subscreens';
import {
  resetTeamInvitation,
  selectTeamInvitation,
} from 'redux/teamInvitation/teamInvitationSlice';

const BACKGROUND_IMAGE = require('../../../../assets/images/BackgroundOnboarding.png');

const Wrapper = styled.View({flex: 1});

const BackgroundImageContainer = styled.View({
  position: 'absolute',
  alignItems: 'flex-end',
  justifyContent: 'center',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
});

const StyledPager = styled(PagerView)({flex: 1});

const ButtonContainer = styled.View({
  alignItems: 'center',
  marginBottom: 10,
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

  // queries
  const {data: user} = useMe();
  const {mutateAsync: joinTeam} = useJoinTeamByCode();

  // redux
  const settings = useSelector(selectSettings);
  const isSaving = useSelector(selectIsSavingSettings);
  const {code} = useSelector(selectTeamInvitation);

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
            goal_active_minutes: user?.goal_active_minutes || 45,
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

  const handleNextPressed = async () => {
    // switch
    setPage(currentPage + 1);

    switch (currentPage) {
      case OnboardingPages.Privacy:
        dispatch(submit());

        if (code) {
          joinTeam(code);
          dispatch(resetTeamInvitation());
        }
        break;

      default:
        setPage(currentPage + 1);
        break;
    }
  };

  const handleBackPressed = () => {
    setPage(currentPage - 1);
  };

  const isContinueEnabled = () => {
    if (isSaving) return false;

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
    if (isSaving) return false;

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
            onBack={isSaving ? undefined : () => setPage(currentPage - 1)}
            onLogout={
              isSaving
                ? undefined
                : () => {
                    dispatch(logout());
                  }
            }
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
              loading={isSaving}
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
          <Logo size={'large'} />
          <BfitSpinner style={{marginTop: 10}} />
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
