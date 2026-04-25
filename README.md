<div align="center">
  <img src="https://github.com/user-attachments/assets/d1699b51-46a3-4160-9227-03f767a4ee08" alt="Pepe Banner" width="20%" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  
  <br />
  
  # 🐸 Pepe Pixel Year (2026 Edition)
  
  **El tracker de estado de ánimo definitivo. Basado en hechos reales. Juzgado por una IA.**
  
  [![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6.0-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![Tailwind](https://img.shields.io/badge/Tailwind-3.0-cyan?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
  [![Google AI Studio](https://img.shields.io/badge/AI-Gemini_Flash-orange?style=for-the-badge&logo=google)](https://aistudio.google.com/)

</div>

---

## 🧐 ¿Qué diantres es esto?

**Pepe Pixel Year** no es el típico tracker anual de "querido diario, hoy estoy triste". Es una aplicación web progresiva (PWA) diseñada para registrar el **LORE** de tu vida diaria con la estética de internet que mereces y en **español**.

> ⚠️ **Nota del Dev:** Este proyecto es un **experimento fan y custom** creado para poner a prueba las capacidades de la **API de Google GenAI** (usando los modelos `Gemini 3 Flash` y `2.5 Flash Image`) integrado con **GitHub** y **Vercel**.

Olvídate de las caritas sonrientes aburridas. Aquí medimos la vida en niveles de **Pepe**: desde *"Rage"* hasta *"Legendario"*. Y lo mejor: **Pepe el Oráculo** analizará tus vivencias para darte un diagnóstico brutalmente honesto, un soundtrack para tu miseria (o éxito) y logros desbloqueables llenos de referencias pop.

## 🚀 Funcionalidades Épicas

* **📅 Calendario de Lore:** Visualización anual completa con mapa de calor, scroll fluido y navegación por meses.
* **⚡ Quick Log (Menú Radial):** ¿Tienes prisa? Mantén pulsado (Long Press) cualquier día para invocar el menú radial y registrar tu mood en 1 segundo.
* **🐸 Niveles de Mood:** 6 niveles de estado de ánimo con GIFs animados de Pepe y paletas de colores neón.
* **✨ Pepe Magic Studio:** La IA **genera un meme de Pepe único** basado en tu nota del día usando `Gemini 2.5 Flash Image`. (Experimental: a veces Pepe está durmiendo la siesta).
* **⚖️ El Tribunal (IA):** Elige entre **Roast Mode** (sarcasmo puro y duro) o **Love Mode** (motivación wholesome). La IA leerá tus registros y dictará sentencia.
* **🏆 Logros Pop Culture:** Sistema de gamificación con referencias a Taylor Swift, Linkin Park, Pokémon, Prison Break y más.
* **☁️ Pepe Mindset:** Una **nube de conceptos interactiva** que agrupa tus temas recurrentes semánticamente.
* **🔍 Buscador de Lore:** Encuentra qué día dijiste que ibas a empezar el gimnasio.
* **🎨 Estética Cyber-Meme:**
    * **Modo Píxel:** Transforma las partículas en arte de 8-bits.
    * **Modo Ahorro:** Para cuando tu batería pide clemencia.
* **🔊 ASMR de UI:** Efectos de sonido satisfactorios (Web Audio API) para cada interacción (pop, click, magic, trash).
* **💾 Tus datos son tuyos:** Exporta e importa copias de seguridad en JSON localmente.

## 🛠️ Stack Tecnológico

Este proyecto ha sido forjado con las herramientas más frescas del mercado:

* **Core:** React 19 + TypeScript.
* **Build Tool:** Vite (Rapidísimo).
* **Estilos:** Tailwind CSS + Lucide Icons + Animaciones CSS Custom.
* **IA & Generación:**
  * `Gemini 3 Flash Preview` (Texto y Análisis).
  * `Gemini 2.5 Flash Image` (Generación de Memes).
  * SDK `@google/genai`.
* **Gráficos:** Recharts (Area, Radar, Pie charts).
* **PWA:** Instalable en móvil y escritorio.

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
  <img src="https://github.com/user-attachments/assets/9f15e927-d7db-4d5a-bad4-f8383882ba98" width="100%" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);" />
</div>

<br/>

### 3. Análisis y Juicio
| Estadísticas Detalladas | El Juicio del Oráculo |
|:---:|:---:|
| *Gráficos de evolución y filtros* | *Diagnóstico y Soundtrack* |
| <img src="https://github.com/user-attachments/assets/112fce3b-2978-43c9-85cf-aaf4b7f6e6b4" width="100%" /> | <img src="https://github.com/user-attachments/assets/be12ff3a-13c7-4bc2-8ec4-ae974714c525" width="100%" /> |

### 4. Exploración Mental
| Buscador de Lore | Pepe Mindset (Nube) |
|:---:|:---:|
| *Encuentra tus recuerdos* | *Tus obsesiones visualizadas* |
| <img src="https://github.com/user-attachments/assets/2d0eaed6-3e37-4f4b-a70f-292602406cd5" width="100%" /> | <img src="https://github.com/user-attachments/assets/8ebbbd49-c336-4666-b076-60a43d52a762" width="100%" /> |

---

<div align="center">
  <p>Developed with 🐸 by <b>Juasmio</b></p>
  <p><i>"Feels Good Man"</i></p>
</div>
