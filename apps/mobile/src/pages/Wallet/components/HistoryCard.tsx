import React from 'react';
import { View, Image } from "react-native";
import { Label, Card } from "@components";
import styled, {useTheme} from 'styled-components/native';

const CardContainer = styled(Card)({
	borderRadius: 17,
	marginBottom: 24,
});

const Row = styled.View({
	paddingVertical: 21,
	paddingHorizontal: 24,
	flexDirection: 'row',
});

const FitlinkLogo = styled.View({
	width: 48,
	height: 48,
	borderRadius: 999,
	alignItems: 'center',
	justifyContent: 'center',
	marginRight: 16,
});

const DividerLine = styled.View({
	width: '100%',
	height: 1,
	backgroundColor: 'rgba(255, 255, 255, .08)',
});

interface HistoryCardProps {

};

export const HistoryCard = () => {
	const { colors } = useTheme();

	return (
		<>
			<CardContainer>
				<Row>
					<FitlinkLogo style={{backgroundColor: colors.text}}>
						<Image source={require('../../../assets/images/fitlink_logo.png')} />
					</FitlinkLogo>
					<View>
						<Label type={'subheading'}>You Earned 21 $BFIT</Label>
						<Label appearance={'secondary'} style={{marginTop: 4}}>19 August 2022</Label>
					</View>
				</Row>
				<DividerLine />
				<Row>
					<Label appearance={'secondary'} style={{lineHeight: 20}}>
						Congrats! You finished 3rd place in the steps callenge league and earned 21 $BFIT
					</Label>
				</Row>
			</CardContainer>
			
			<CardContainer>
				<Row>
					<FitlinkLogo style={{backgroundColor: colors.accent}}>
						<Image source={require('../../../assets/images/fitlink_logo.png')} />
					</FitlinkLogo>
					<View>
						<Label type={'subheading'}>You Staked 400 $BFIT</Label>
						<Label appearance={'secondary'} style={{marginTop: 4}}>14 June 2022</Label>
					</View>
				</Row>
				<DividerLine />
				<Row>
					<Label appearance={'secondary'} style={{lineHeight: 20}}>
						Good job! You staked 400 $BFIT which moves you to the Gold Tier Level.
					</Label>
				</Row>
			</CardContainer>
			
			<CardContainer>
				<Row>
					<FitlinkLogo style={{backgroundColor: colors.secondaryText}}>
						<Image source={require('../../../assets/images/fitlink_logo.png')} />
					</FitlinkLogo>
					<View>
						<Label type={'subheading'}>You Spent 159 $BFIT</Label>
						<Label appearance={'secondary'} style={{marginTop: 4}}>02 June 2022</Label>
					</View>
				</Row>
				<DividerLine />
				<Row>
					<Label appearance={'secondary'} style={{lineHeight: 20}}>
						Nice one! You spent 159 $BFIT on a Garmin Watch Fenix 6S Pro as a Fitlink reward.
					</Label>
				</Row>
			</CardContainer>
		</>
	);
};