import api from '@api';
import analytics from '@react-native-firebase/analytics';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {LeaguePublic} from '@fitlink/api/src/modules/leagues/entities/league.entity';

type InviteDeeplinkEvent = {
  leagueId: string;
  inviterUserId?: string;
};

export class AnalyticsService {
  static async sendInviteDeeplinkEvent({
    leagueId,
    inviterUserId,
  }: InviteDeeplinkEvent) {
    try {
      const inviterUser = await api.get<User>(`/users/${inviterUserId}`);
      const league = await api.get<LeaguePublic>(`/leagues/${leagueId}`);
      const newcomerUser = await api.get<User>('/me');
      await analytics().logEvent('league_invite_deeplink_pressed', {
        league_id: leagueId,
        league_name: league.name,
        inviter_user_id: inviterUserId,
        inviter_user_name: inviterUser.name,
        newcomer_user_id: newcomerUser.id,
        newcomer_user_email: newcomerUser.email,
      });
      console.log('sendInviteDeeplinkEvent');
    } catch (e) {
      console.log('sendInviteDeeplinkError', e);
    }
  }
}
