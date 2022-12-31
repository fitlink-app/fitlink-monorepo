import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {UpdateLeagueDto} from '@fitlink/api/src/modules/leagues/dto/update-league.dto';
import {Activity} from '@fitlink/api/src/modules/activities/entities/activity.entity';

export type RootStackParamList = {
  AuthenticationNavigator: undefined;
  HomeNavigator: undefined;
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Onboarding: undefined;
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
  Reward: {id: string; image: string};
  HealthActivityDetails: {id: string};
  Route: {
    polyline: string;
  };
  MyActivities: {
    onAddNewActivityPressed: () => void;
    onActivityPressed: (activityId: string) => void;
  };
  ActivityForm: {
    action: 'create' | 'edit';
    id?: string;
    geo?: any;
    data?: Activity;
    onSubmitCallback?: () => void;
    onDelete?: (
      id: string,
      onDeleteCompleted?: () => void,
      onClose?: () => void,
    ) => void;
  };
  Notifications: undefined;
  ActivityPage: undefined;
  Wallet: undefined;
};
