# Instalación

> Necesitas tener instalado node, [tutorial](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

Clona este repositorio y ejecuta el comando `npm install` para instalar las dependencias de este proyecto.

Una vez instalados los paquetes, ejecuta el siguiente comando:

```bash
npm i -G .
```

Ahora podrás usar el comando `subtitle-ai` para crear subtítulos a tus videos desde cualquier parte del sistema.

## Ejemplos

### Crear subtítulos

```bash
subtitle-ai -key "sk-***" -a ruta/al/video.mp4
```

Esto creará una carpeta llamada **subtitles** con 4 archivos: **subtitulos-frases.srt**, **subtitulos-palabras.srt**, **subtitulos-frases.vtt**, **subtitulos-palabras.vtt**.

### Especificar la carpeta de salida

Si quieres especificar la carpeta de salida:

```bash
subtitle-ai -key "sk-***" -a ruta/al/video.mp4 -o ruta/destino/
```

### Especificar tipo de subtítulo

Si quieres especificar el tipo de subtítulo:

```bash
subtitle-ai -key "sk-***" -a ruta/al/video.mp4 -t srt
```

Pueden ser de tipo srt o vtt. Si no pones nada, se crearán ambos tipos de archivos.

### Especificar modo de subtítulo

Si quieres especificar el modo de subtítulo:

```bash
subtitle-ai -key "sk-***" -a ruta/al/video.mp4 -m frases
```

Pueden ser de tipo frases o palabras. Si no pones nada, se crearán ambos tipos de archivos.
La diferencia entre ambos es que el modo **frases** crea subtítulos basados en frases, mientras que el modo **palabras** crea los subtítulos basados en cada palabra.

Ejemplo con modo frases:

```text
9
00:00:29,139 --> 00:00:34,540
 a notificar el uso de IA en los vídeos, esto a mí me molesta bastante.

10
00:00:34,540 --> 00:00:38,580
 Sobre todo porque yo utilizo IA, pero bueno, este vídeo no es para hablar de ese tema,
```

Ejemplo con modo palabras:

```text
99
00:00:29,260 --> 00:00:29,719
notificar

100
00:00:29,719 --> 00:00:30,040
el

101
00:00:30,040 --> 00:00:30,239
uso

102
00:00:30,239 --> 00:00:30,440
de
```
