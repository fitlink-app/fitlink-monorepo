import React from "react";
import { View, Dimensions, ScrollView } from "react-native";
import { Navbar, Label, Card, Icon } from "@components";
import { useNavigation } from "@react-navigation/core";
import styled, {useTheme} from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { HistoryCard } from "./components/HistoryCard";

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

const Wrapper = styled.View({
	paddingHorizontal: 10,
	paddingTop: 40,
});

const WalletCard = styled(Card)({
	borderRadius: 26,
  paddingTop: 32,
  paddingBottom: 41,
	alignItems: 'center',
	justifyContent: 'center',
});

const LogoImage = styled.Image({
	width: 125,
	height: 24,
});

const WalletLabel = styled(Label).attrs(() => ({
	type: 'title',
	appearance: 'accent',
	bold: true,
}))({
	marginLeft: 11,
});

const WalletChart = styled.Image({
	marginTop: 22,
});

const ButtonGroup = styled.View({
	width: SCREEN_WIDTH * 0.7,
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
	alignSelf: 'center',
	marginTop: 28,
});

const ButtonContainer = styled.View({
	width: 68,
	height: 68,
	borderRadius: 999,
	borderWidth: 2,
	borderColor: '#FFFFFF',
	justifyContent: 'center',
	alignItems: 'center',
});

const SellIcon = styled.Image({});

const StakeIcon = styled.Image({});

export const Wallet = () => {

	const navigation = useNavigation();
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();

	return (
		<Wrapper>
			<ScrollView>
				<WalletCard>
					<Navbar
						centerComponent={
							<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
								<LogoImage source={require('../../../assets/images/logo.png')} />
								<WalletLabel>WALLET</WalletLabel>
							</View>
						}
						iconColor={colors.text}
					/>
					<Label style={{fontSize: 38, marginTop: 40}}>00640 $BFIT</Label>
					<Label style={{fontSize: 20, marginTop: 10}} appearance={'secondary'}>$ 286.74</Label>
					<WalletChart source={require('../../../assets/images/wallet_chart_3x.png')} />
				</WalletCard>

				<ButtonGroup>
					<View>
						<ButtonContainer>
							<Icon name={'plus'} size={20} color={colors.accent} />
						</ButtonContainer>
						<Label style={{alignSelf: 'center', marginTop: 16}}>BUY</Label>
					</View>
					<View>
						<ButtonContainer>
							<SellIcon source={require('../../../assets/images/icon/sell.png')} />
						</ButtonContainer>
						<Label style={{alignSelf: 'center', marginTop: 16}}>BUY</Label>
					</View>
					<View>
						<ButtonContainer>
							<StakeIcon source={require('../../../assets/images/icon/stake.png')} />
						</ButtonContainer>
						<Label style={{alignSelf: 'center', marginTop: 16}}>BUY</Label>
					</View>
				</ButtonGroup>

				<Label type={'title'} style={{marginTop: 40, marginBottom: 17}}>EARNING HISTORY</Label>

				<HistoryCard />
			</ScrollView>
		</Wrapper>
	);
};