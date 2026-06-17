import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

const getEncryptionKey = () => {
  if (!ENCRYPTION_KEY) {
    throw new Error(
      "La variable de entorno VITE_ENCRYPTION_KEY no está definida. Agrega un .env con VITE_ENCRYPTION_KEY."
    );
  }
  return ENCRYPTION_KEY;
};

/**
 * Encripta un texto
 * @param {string} text - Texto a encriptar
 * @returns {string} - Texto encriptado en base64
 */
export const encrypt = (text) => {
  const key = getEncryptionKey();
  return CryptoJS.AES.encrypt(text, key).toString();
};

/**
 * Desencripta un texto
 * @param {string} encryptedText - Texto encriptado
 * @returns {string} - Texto desencriptado
 */
export const decrypt = (encryptedText) => {
  const key = getEncryptionKey();
  return CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8);
};
