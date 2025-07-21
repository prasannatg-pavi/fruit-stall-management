// utils/crypto.js
import CryptoJS from 'crypto-js';

const SECRET_KEY = '1324#34*568$798^'; // Must match during encrypt/decrypt

export const encryptPassword = (password) => {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
};

export const decryptPassword = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};