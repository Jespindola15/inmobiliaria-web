import CryptoJS from 'crypto-js';

const DEFAULT_ENCRYPTION_KEY = "inmobiliaria_app_secret_key_2024_secure";
const ENV_ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

const getEncryptionKey = () => {
  return ENV_ENCRYPTION_KEY ?? DEFAULT_ENCRYPTION_KEY;
};

const decryptWithKey = (encryptedText, key) => {
  try {
    return CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
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
  const envKey = ENV_ENCRYPTION_KEY;
  const key = getEncryptionKey();
  const decrypted = decryptWithKey(encryptedText, key);

  if (envKey && key !== DEFAULT_ENCRYPTION_KEY && !decrypted) {
    console.warn(
      "La clave de entorno VITE_ENCRYPTION_KEY no funcionó. Se intentará con la clave por defecto. Actualiza .env si es necesario."
    );
    return decryptWithKey(encryptedText, DEFAULT_ENCRYPTION_KEY);
  }

  return decrypted;
};
