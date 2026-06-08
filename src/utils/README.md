# Sistema de Autenticación Encriptado

Este directorio contiene utilidades para la autenticación encriptada del panel admin.

## Archivos

### `encryptionUtils.js`

Funciones para encriptar y desencriptar datos usando AES-256.

**Funciones:**

- `encrypt(text)` - Encripta un texto
- `decrypt(encryptedText)` - Desencripta un texto

### Cambiar Credenciales

Si necesitas cambiar el usuario o contraseña:

1. **Edita el archivo** `generateCredentials.cjs` en la raíz del proyecto:

   ```javascript
   const CREDENTIALS = {
     usuario: "NuevoUser", // Cambiar aquí
     contraseña: "NuevaPass", // Cambiar aquí
   };
   ```

2. **Ejecuta el script** para generar los nuevos valores encriptados:

   ```bash
   node generateCredentials.cjs
   ```

3. **Copia el JSON** que muestra en la consola

4. **Actualiza** `public/config/credentials.json` con el nuevo JSON

5. **Elimina** el archivo `generateCredentials.cjs` de la raíz (opcional, por seguridad)

## Seguridad

- Las credenciales están encriptadas con AES-256 usando una clave fija
- Las credenciales desencriptadas solo existen en memoria durante la validación
- La clave de encriptación está en `encryptionUtils.js`

**Nota:** Para mayor seguridad en producción, considera:

- Usar una clave de encriptación diferente (cambiar `ENCRYPTION_KEY`)
- Guardar las credenciales en un servidor backend
- Implementar 2FA (autenticación de dos factores)
