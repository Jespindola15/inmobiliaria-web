const CryptoJS = require('crypto-js');

// Usar la MISMA clave que en encryptionUtils.js
const ENCRYPTION_KEY = "inmobiliaria_app_secret_key_2024_secure";

// Las credenciales sin encriptar
const CREDENTIALS = {
  usuario: "Admin123",
  contraseña: "Entrar123"
};

console.log("=== GENERADOR DE CREDENCIALES ENCRIPTADAS ===\n");
console.log("Este script genera las credenciales encriptadas para el archivo credentials.json\n");

// Encriptar las credenciales
const usuarioEncriptado = CryptoJS.AES.encrypt(CREDENTIALS.usuario, ENCRYPTION_KEY).toString();
const contraseñaEncriptada = CryptoJS.AES.encrypt(CREDENTIALS.contraseña, ENCRYPTION_KEY).toString();

// Mostrar el JSON resultante
const credentialsJSON = {
  credentials: {
    usuario: usuarioEncriptado,
    contraseña: contraseñaEncriptada
  }
};

console.log("Copia este JSON en: public/config/credentials.json\n");
console.log(JSON.stringify(credentialsJSON, null, 2));

console.log("\n=== VERIFICACIÓN ===");
console.log("Usuario desencriptado:", CryptoJS.AES.decrypt(usuarioEncriptado, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8));
console.log("Contraseña desencriptada:", CryptoJS.AES.decrypt(contraseñaEncriptada, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8));
