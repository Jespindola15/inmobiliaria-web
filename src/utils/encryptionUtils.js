import CryptoJS from 'crypto-js';

// Clave de encriptación (debe ser compleja y única para tu aplicación)
const ENCRYPTION_KEY = "inmobiliaria_app_secret_key_2024_secure";

/**
 * Encripta un texto
 * @param {string} text - Texto a encriptar
 * @returns {string} - Texto encriptado en base64
 */
export const encrypt = (text) => {
  const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  return encrypted;
};

/**
 * Desencripta un texto
 * @param {string} encryptedText - Texto encriptado
 * @returns {string} - Texto desencriptado
 */
export const decrypt = (encryptedText) => {
  const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
  return decrypted;
};
