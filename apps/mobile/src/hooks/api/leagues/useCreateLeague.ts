import {useMutation} from 'react-query';
import api from '@api';
import {CreateLeagueDto} from '@fitlink/api/src/modules/leagues/dto/create-league.dto';
import {LeaguePublic} from '@fitlink/api/src/modules/leagues/entities/league.entity';

export function useCreateLeague() {
  return useMutation((dto: CreateLeagueDto) =>
    api.post<LeaguePublic>(`/leagues`, dto as any),
  );
}
