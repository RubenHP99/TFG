
# DOODLE A DOODLE
Aplicación multijugador para la identificación de trazos mediante la utilización de redes neuronales. Además, los usuarios pueden crear o unirse a salas que hayan sido configuradas anteriormente por otros.
La aplicación cuenta con varios modos de juego distintos para ofrecer la mayor variedad posible, pudiéndose cambiar ciertos parámetros de configuración de los mismos, como el número de jugadores, rondas...
Durante el desarrollo del juego, los usuarios deben dibujar el objeto que se les indica para qué posteriormente la inteligencia artificial valide el dibujo e indique el resultado con el porcentaje de precisión de dicho objeto. También se ofrece la posibilidad de crear una cuenta en la aplicación para registrar los datos de las partidas que jueguen, a parte del resto de funcionalidades clásicas relacionadlas con la gestión de una cuenta.


# INSTALACIÓN
-Es necesario instalar Python 3.11.3 para evitar problemas de incompatibilidad con los paquetes.<br />
-En Linux se accede a la carpeta /bin para usar Python.<br />
-Es necesario instalar node y npm (versión igual o superior a 10.2.4).<br />
-Ejecutar el comando "npm i" para instalar los datos relacionados con Vite.<br />

Las librerías necesarias para la ejecución de los archivos de Python están desinstaladas para ahorrar espacio.

Instalar librerias de python:
```bash
cd doodleAdoodle
bin/python -m pip install -r requirements.txt 
```
Desinstalar librerias de python
```bash
cd doodleAdoodle
bin/python -m pip uninstall -r requirements.txt -y
```

# DESPLIEGUE
Servidor Flask con el modelo de la red neuronal convolucional:
```bash
cd doodleAdoodle
bin/python app/src/model/CNNServer.py
```

Servidor Flask con la base de datos de usuarios:
```bash
cd doodleAdoodle
bin/python app/src/model/dataBaseServer.py
```

Servidor de React de la aplicación web:
```bash
cd doodleAdoodle/app
npm run dev -- --host
```

Servidor multijugador de Socket.io:
```bash
cd doodleAdoodle
node app/src/model/socketIOServer.js
```


# NOTA
Para el correcto funcionamiento del envío de correos electrónicos es necesario crear una contraseña de aplciación y guardarla en la raiz del proyecto con el nombre ".password.txt".
