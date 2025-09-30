## Comenzar

1. Instala las dependencias

```bash
npm install
```

2. Instala la app Expo Go en tu teléfono

3. Clona el repositorio en tu computador. Desde la carpeta principal, ejecuta el websocket:

```bash
node ws-mock.js
```

3. Configura la ruta del websocket en constants/config.ts

    Si ejecutas la app en un simulador local en tu computador, debería ser:
    ws://localhost:8081

    Si usas Expo Go, recomiendo instalar y ejecutar NGrok para exponer el websocket.
    En tu terminal, ejecuta:

```bash
ngrok tcp 8081
```

   Esto expone tu puerto 8081.
   Copia la ruta de redireccionamiento en el archivo config (debe usar ws:// como protocolo, no tcp://).

4. Ejecuta Expo

```bash
npx expo start
```

   Esto mostrará un código QR en tu pantalla. Escaneándolo desde tu teléfono con la app Expo Go, se abrirá la aplicación.

   Presionando 'a' en la terminal se abrirá el simulador de Android (si tienes Android Studio instalado).

   Presionando 'i' se abrirá el simulador de iOS (si tienes Xcode instalado).

Si después de escanear el QR tu teléfono no encuentra la ruta, puede que necesites exponer la app mediante tunneling:

```bash
npx expo start --tunnel
```

5. Limitaciones
   La mayor limitacion la encontre en como se construye la serie de tiempo del dia, ya que comienza a correr en el momento en que se instancia el websocket, principalmente pensado para simular valores en vivo. Asumi que lo mas honesto era no modificar el ws-mock entregado, por lo que no fue posible mostrar variaciones diarias en el dashboard, solo valores en vivo.

6. Tiempo invertido

   En el proyecto se invirtieron cerca de 6 hrs netas. Las mayores dificultades se encontraron en configurar la aplicacion Expo de una forma sencilla que pudiera correr en cualquier computador sin necesidad de una cuenta EAS o de descargar un APK. La representacion de los graficos fue mas directa.

7. Uso de IA

   Se utilizo IA en la construccion del hook, que era la manera mas eficiente de recibir los datos del websocket.
   El resto de la aplicacion se baso en experiencia previa, con uso de IA para resolucion de errores y recomendaciones de buenas practicas principalmente.