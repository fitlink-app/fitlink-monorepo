import {useContext} from 'react';
import {AuthContext} from '../../contexts/Auth.context';

export function useAuth() {
  return useContext(AuthContext);
}
