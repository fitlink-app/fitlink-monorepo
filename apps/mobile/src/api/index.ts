import Axios from 'axios';
import {makeApi} from '@fitlink/api-sdk';

const axios = Axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

export default makeApi(axios);
