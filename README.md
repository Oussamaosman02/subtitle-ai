# Instalación

> Necesitas tener instalado node, [tutorial](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) y ffmpeg [instalar](https://ffmpeg.org/download.html)

Clona este repositorio y ejecuta el comando `npm install` para instalar las dependencias de este proyecto.

Una vez instalados los paquetes, ejecuta el siguiente comando:

```bash
npm i -g .
```

Ahora podrás usar el comando `subtitle-ai` para crear subtítulos a tus videos desde cualquier parte del sistema usando la terminal.

## Uso sin instalación

También puedes usarlo sin tener que instalarlo a nivel de sistema, para ello, una vez instalados los paquetes (`npm install`), ejecuta el siguiente comando:

```bash
npm run start -key "sk-***" -v ruta/al/video.mp4
```

Para los ejemplos, sería igual, solamente cambiando `subtitle-ai` por `npm run start`.

## Ejemplos de uso

### A tener en cuenta

La key será la api key de OpenAi, puedes generar una [aquí](https://platform.openai.com/api-keys).

En el proceso se crea una carpeta llamada `.temp`, **no la borres**, ya que se borrará de manera automática cuando el proceso haya acabado y sin ella fallaría.

### Crear subtítulos

```bash
subtitle-ai -key "sk-***" -v ruta/al/video.mp4
```

Esto creará una carpeta llamada **subtitles** con 5 archivos: **subtitulos-frases.srt**, **subtitulos-palabras.srt**, **subtitulos-frases.vtt**, **subtitulos-palabras.vtt** y **subtitulos-texto.txt**.

### Crear subtítulos de un video de YouTube

```bash
subtitle-ai -key "sk-***" -u "https://www.youtube.com/..."
```

EL vídeo será descargado en la carpeta `.temp`, si quieres guardarte también el vídeo, deberás copiarlo antes de que el proceso finalice, ya que la carpeta se borrará automáticamente.

### Especificar la carpeta de salida

Si quieres especificar la carpeta de salida:

```bash
subtitle-ai -key "sk-***" -v ruta/al/video.mp4 -s ruta/destino/
```

Por defecto, se crea la carpeta **subtitles**.

### Especificar tipo de subtítulo

Si quieres especificar el tipo de subtítulo:

```bash
subtitle-ai -key "sk-***" -v ruta/al/video.mp4 -t srt
```

Pueden ser de tipo srt o vtt.

Por defecto se crearán ambos tipos de archivos.

### Especificar modo de subtítulo

Si quieres especificar el modo de subtítulo:

```bash
subtitle-ai -key "sk-***" -v ruta/al/video.mp4 -m frases
```

Pueden ser de tipo frases o palabras.

Por defecto se crearán ambos tipos de archivos.

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

### Crear subtítulos de un archivo JSON

```bash
subtitle-ai -key "sk-***" -j ruta/al/archivo.json
```

Estructura del archivo JSON:

```json
[
  {
    "url": "https://www.youtube.com/live/jLwrYL3C57c?si=qGZALr6ZIe520wq3",
    "outputDir": "javi-linares",
    "prefix": "javi"
  },
  {
    "url": "https://www.youtube.com/watch?v=Jf0Y_jw0-yE",
    "outputDir": "design-finance-eu-3"
  },
  {
    "url": "https://www.youtube.com/watch?v=TNc1KYE4NHU",
    "outputDir": "sergi-torrens-3",
    "prefix": "sergi",
    "type": "srt",
    "mode": "frases"
  }
]
```

Los propiedades que acepta son:

| Propiedad | Equivalencia                           |
| --------- | -------------------------------------- |
| url       | -u o --url (opcional si video)         |
| video     | -v o --video (opcional si url)         |
| type      | -t o --type (opcional)                 |
| mode      | -m o --mode (opcional)                 |
| prefix    | por defecto es "subtitulos" (opcional) |
| outputDir | -s o --outputDir (opcional)            |

> Es necesario al menos usar -v, -j o -u ya que son obligatorios, pero no son complementarios, solo debes escoger uno.
