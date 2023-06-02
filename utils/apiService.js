import axios from 'axios';

import { API_URL, JWT_TOKEN } from '../config/config';
import { getLocalStorage } from './storageUtil';
import handleToastify from '../components/Toast';
export const apiService = () => {
  const api = axios.create({
    baseURL: `${API_URL}`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: getLocalStorage(JWT_TOKEN) ? 'Bearer ' + getLocalStorage(JWT_TOKEN) : 'Bearer',
    },
    responseType: 'json',
  });

  api.interceptors.response.use(
    (response) => {
      if (response.status === 200 && response.data.code == 200) {
        return response.data.payload;
      } else {
        handleToastify('bg-danger', response.data.message || response.error);
        return Promise.reject(response.data.message || response.error);
      }
    },
    (error) => {
      handleToastify(
        'bg-danger',
        'We’ve detected a poor network connection. Please check your internet connection and try again.'
      );
      return Promise.reject(error.message);
    }
  );

  return api;
};
