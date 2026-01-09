<div align="center">
  <img src="https://github.com/user-attachments/assets/d1699b51-46a3-4160-9227-03f767a4ee08" alt="Pepe Banner" width="20%" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  
  <br />
  
  # 🐸 Pepe Pixel Year (2026 Edition)
  
  **El tracker de estado de ánimo definitivo. Basado en hechos reales. Juzgado por una IA.**
  
  [![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6.0-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![Tailwind](https://img.shields.io/badge/Tailwind-3.0-cyan?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
  [![Google AI Studio](https://img.shields.io/badge/AI-Gemini_Pro-orange?style=for-the-badge&logo=google)](https://aistudio.google.com/)

</div>

---

## 🧐 ¿Qué es esto?

**Pepe Pixel Year** no es el típico tracker anual de "querido diario, hoy estoy triste". Es una aplicación web progresiva (PWA) diseñada para registrar el **LORE** de tu vida diaria con la estética de internet que mereces y en **español**.

> ⚠️ **Nota del Dev:** Este proyecto es un **experimento fan y custom** creado en **un fin de semana** para poner a prueba las capacidades de **Google AI Studio** (que utiliza **Gemini 3 Pro Preview**) integrado con **GitHub** y **Vercel**, con commits automáticos que incluso elaboran un mensaje customizado identificando todos los cambios.

Olvídate de las caritas sonrientes aburridas. Aquí medimos la vida en niveles de **Pepe**: desde *"Legendario"* hasta *"Fatal"*. Y lo mejor: **Pepe el Oráculo** (impulsado por IA) analizará tus vivencias de cada periodo para darte un diagnóstico brutalmente honesto, un soundtrack para tu miseria (o éxito) y logros desbloqueables.

## 🚀 Funcionalidades Épicas

* **📅 Calendario de Lore:** Visualización anual completa con mapa de calor estilo GitHub.
* **🐸 Niveles de Mood:** 6 niveles de estado de ánimo con GIFs animados de Pepe (desde Rage hasta Legendario).
* **✨ Pepe Magic Studio:** ¿No tienes foto? La IA **genera un meme de Pepe único** basado en tu nota del día usando `Gemini 2.5 Flash Image`.
* **☁️ Pepe Mindset:** Una **nube de palabras interactiva** que analiza tus obsesiones y temas recurrentes del año.
* **🤖 El Oráculo de Pepe (IA):** Conectado a **Google AI Studio** para juzgar tus notas. Te dará:
    * Diagnósticos sarcásticos de "Pepe Millennial".
    * Recomendaciones musicales.
    * Logros absurdos (ej: *"Campeón Regional en no hacer nada"*).
* **🔍 Buscador de Lore:** Encuentra qué día dijiste que ibas a empezar el gimnasio.
* **🔊 ASMR de UI:** Efectos de sonido satisfactorios para cada interacción (pop, click, magic, trash).
* **📊 Estadísticas Avanzadas:** Gráficos de área, radar semanal, distribución de mood y gamificación con logros.
* **💾 Backup Local:** Exporta e importa tus datos en JSON. Tus datos son tuyos.
* **📱 Diseño Mobile-First:** Animaciones fluidas, respuesta háptica (vibración) y efectos de partículas reactivas.

## 🛠️ Stack Tecnológico

Este proyecto ha sido forjado con las herramientas más frescas del mercado:

* **Core:** React 19 + TypeScript.
* **Build Tool:** Vite (Rapidísimo).
* **Estilos:** Tailwind CSS + Lucide Icons.
* **IA & Generación:**
  *  `Google AI Studio` con `Gemini 3 Pro Preview`.
  * `Gemini 2.5 Flash Image`.
* **Gráficos:** Recharts (Area, Radar, Pie charts).
* **Audio:** Web Audio API custom engine.
* **Efectos:** Canvas Particles & CSS Animations.

## ⚡ Instalación y Despliegue

¿Quieres correr esto en tu máquina local? Sigue el tutorial, compañero:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/JuanmaWL/PepeMoodTracker.git
    cd PepeMoodTracker
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura la API Key:**
    Crea un archivo `.env` en la raíz y añade tu clave de Google AI Studio:
    ```env
    VITE_PEPE_MOOD_KEY=tu_api_key_aqui
    ```

4.  **Arranca el servidor:**
    ```bash
    npm run dev
    ```

## 🌍 Variables de Entorno (Deploy)

Si lo subes a **Vercel** o **Netlify**, asegúrate de configurar las variables de entorno en el panel de control de la plataforma:

| Variable | Descripción |
| :--- | :--- |
| `VITE_PEPE_MOOD_KEY` | Tu API Key de Google Gemini (AI Studio). |

## 📸 Capturas

### 1. Vista Principal (El Calendario)
*Visualiza tu año en píxeles y mapa de calor.*
<div align="center">

  <img src="https://github.com/user-attachments/assets/f087da36-4290-4692-b6ee-241492031584" width="100%" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);" />
</div>

<br/>

### 2. Registro de Lore (Día a Día)
*Elige tu mood, escribe tu historia o genera un meme mágico.*
<div align="center">
  <img src="https://github.com/user-attachments/assets/9f15e927-d7db-4d5a-bad4-f8383882ba98" width="60%" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);" />
</div>

<br/>

### 3. Análisis y Juicio
| Estadísticas Detalladas | El Juicio del Oráculo |
|:---:|:---:|
| *Gráficos de evolución y filtros* | *Diagnóstico y Soundtrack* |
| <img src="https://github.com/user-attachments/assets/112fce3b-2978-43c9-85cf-aaf4b7f6e6b4" width="100%" /> | <img src="https://github.com/user-attachments/assets/910e23fc-9693-4f10-8a32-ceef7e6f875d" width="100%" /> |

### 4. Exploración Mental
| Buscador de Lore | Pepe Mindset (Nube) |
|:---:|:---:|
| *Encuentra tus recuerdos* | *Tus obsesiones visualizadas* |
| <img src="https://github.com/user-attachments/assets/0f04bc08-7265-4b6f-9e67-df0933e3b728" width="100%" /> | <img src="https://github.com/user-attachments/assets/8b046a60-554c-4b9a-b30e-494a445592dc" width="100%" /> |

---

<div align="center">
  <p>Developed with 🐸 by <b>Juasmio</b></p>
  <p><i>"Feels Good Man"</i></p>
</div>
