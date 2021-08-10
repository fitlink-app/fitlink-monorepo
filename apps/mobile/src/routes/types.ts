import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {UpdateLeagueDto} from '@fitlink/api/src/modules/leagues/dto/update-league.dto';

export type RootStackParamList = {
  AuthenticationNavigator: undefined;
  HomeNavigator: undefined;
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: {email?: string};
  Settings: undefined;
  UpdateEmail: undefined;
  UpdatePassword: undefined;
  Webview: {url: string; title: string};
  Friends: {tab: number};
  Leagues: {tab: number};
  League: {id: string; league?: League};
  Profile: {id: string};
  LeagueInviteFriends: {
    leagueId: string;
  };
  LeagueForm: {data?: {id: string; dto: UpdateLeagueDto; imageUrl: string}};
  Rewards: undefined;
  Reward: {id: string};
  ActivityDetails: {id: string};
  Route: {
    polyline: string;
  };
};
