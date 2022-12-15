import React from 'react';
import { View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import { Card, Label, Avatar, TouchHandler } from '@components';

const UserCard = styled.View({
    marginTop: 23,
    width: '100%',
    height: 134,
});

const Line = styled.View({
    width: '100%',
    height: 3,
    background: '#565656',
    opacity: 0.5,
});

const CardBody = styled.View({
    width: '100%',
    height: 131,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
});

const UserProfile = styled.View({
    width: '57%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const FitnessDetails = styled.View({
    width: '43%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
});

const UserInfo = styled.View({
    width: '60%',
});

const FitnessType = styled(Label).attrs(() => ({
    type: 'subheading',
    appearance: 'accent',
}))({
    width: '100%',
    fontFamily: 'Roboto',
    lineHeight: 19,
    textTransform: 'capitalize',
    marginTop: -10,
});

const Username = styled(Label).attrs(() => ({
    type: 'subheading',
}))({
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 16,
    textTransform: 'capitalize',
    marginTop: 6,
});

const DateText = styled(Label).attrs(() => ({
    type: 'subheading',
}))({
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 16,
    color: '#ACACAC',
    marginTop: 6,
});

const ButtonGroup = styled.View({
    height: 36,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 7,
});

const Bfit = styled.View({
    height: 30,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 17,
    paddingRight: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
});

const BfitValue = styled(Label).attrs(() => ({
    type: 'caption',
}))({
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 14,
    color: '#060606',
});

const LikeButton = styled.View({
    marginLeft: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
});

const ThumbIcon = styled.Image({});

const DetailView = styled.View({
    marginTop: 7,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
});

const DetailInfo = styled(Label).attrs(() => ({
    type: 'caption',
}))({
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 16,
    color: '#ACACAC',
});

const DetailIcon = styled.Image({
    marginLeft: 10,
});

interface ActivityItemProps {
    img?: string;
    fitnessType?: string;
    username?: string;
    date?: string;
    mark?: string;
    like?: boolean;
    distance?: string;
    speed?: string;
    time?: number;
};

export const ActivityItem = (props: ActivityItemProps) => {
    const {img, fitnessType, username, date, mark, like, distance, speed, time, ...rest} = props;

    const navigation = useNavigation();
    const { colors } = useTheme();

    return (
        <TouchHandler onPress={() => navigation.navigate('ActivityPage')}>
            <UserCard>
                <Line />
                <CardBody>
                    <UserProfile>
                        <Avatar size={76} radius={18} />
                        <UserInfo>
                            <FitnessType>{fitnessType}</FitnessType>
                            <Username>{username}</Username>
                            <DateText>{date}</DateText>
                        </UserInfo>
                    </UserProfile>
                    <FitnessDetails>
                        <View>
                            <ButtonGroup>
                                <Bfit>
                                    <BfitValue>{mark}</BfitValue>
                                </Bfit>
                                {like ? (
                                    <LikeButton
                                        style={{ backgroundColor: colors.accent }}>
                                        <ThumbIcon
                                            source={require('../../../assets/images/icon/thumb.png')}
                                        />
                                    </LikeButton>
                                ) : (
                                    <LikeButton style={{ backgroundColor: '#ACACAC' }}>
                                        <ThumbIcon
                                            source={require('../../../assets/images/icon/thumb.png')}
                                        />
                                    </LikeButton>
                                )}
                            </ButtonGroup>
                            <DetailView>
                                <DetailInfo>
                                    Distance:{' '}
                                    <Label style={{ color: colors.text }}>
                                        {distance} mi
                                    </Label>
                                </DetailInfo>
                                <DetailIcon
                                    source={require('../../../assets/images/icon/map-marker.png')}
                                />
                            </DetailView>
                            <DetailView>
                                <DetailInfo>
                                    Speed:{' '}
                                    <Label style={{ color: colors.text }}>
                                        {speed} mile
                                    </Label>
                                </DetailInfo>
                                <DetailIcon
                                    source={require('../../../assets/images/icon/speed.png')}
                                />
                            </DetailView>
                            <DetailView>
                                <DetailInfo>
                                    Time:{' '}
                                    <Label style={{ color: colors.text }}>{time} m</Label>
                                </DetailInfo>
                                <DetailIcon
                                    source={require('../../../assets/images/icon/clock.png')}
                                />
                            </DetailView>
                        </View>
                    </FitnessDetails>
                </CardBody>
            </UserCard>
        </TouchHandler>
    )
}