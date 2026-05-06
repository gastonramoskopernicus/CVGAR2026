export const toolStackCategories = [
  {
    id: "automation",
    title: "Automatización y Orquestación",
    description: "Flujos de trabajo, extracción de datos y oráculos.",
    tools: [
      {
        name: "MAKE",
        description: "Plataforma de automatización visual para construir flujos, integraciones y procesos sin código.",
        url: "https://www.make.com",
        tags: ["Workflow", "No-Code"],
        category: "Automatización",
        featured: true,
        type: "platform"
      },
      {
        name: "Apify",
        description: "Actores, scraping, automatización de extracción de datos y oráculos para flujos inteligentes.",
        url: "https://console.apify.com/actors/BHzefUZlZRKWxkTck/input",
        tags: ["Scraping", "Data"],
        category: "Extracción",
        featured: false,
        type: "tool"
      },
      {
        name: "Skills.sh",
        description: "Conexión de agentes y herramientas mediante MCP / skills framework.",
        url: "http://Skills.sh",
        tags: ["Agentes", "MCP"],
        category: "Framework",
        featured: true,
        type: "platform"
      }
    ]
  },
  {
    id: "conversational-ai",
    title: "IA Conversacional y Asistentes",
    description: "Modelos de lenguaje, copilot y análisis avanzado.",
    tools: [
      {
        name: "Claude Cowork",
        description: "Asistente IA para productividad, análisis y colaboración avanzada.",
        url: "#",
        tags: ["LLM", "Asistente"],
        category: "Productividad",
        featured: true,
        type: "ai"
      },
      {
        name: "Gemini 3",
        description: "Modelo multimodal de Google para generación, razonamiento y análisis avanzado.",
        url: "https://gemini.google.com/",
        tags: ["Multimodal", "LLM"],
        category: "Generación",
        featured: true,
        type: "ai"
      },
      {
        name: "NotebookLM 2026",
        description: "Workspace de investigación asistido por IA para documentos, PDFs y conocimiento contextual.",
        url: "https://notebooklm.google.com/",
        tags: ["Research", "RAG"],
        category: "Investigación",
        featured: true,
        type: "ai"
      },
      {
        name: "Google AI Studio",
        description: "Entorno de prototipado y desarrollo IA para prompts, modelos y experiencias generativas.",
        url: "https://aistudio.google.com/",
        tags: ["Desarrollo", "Prototipado"],
        category: "Dev",
        featured: false,
        type: "platform"
      }
    ]
  },
  {
    id: "design-front",
    title: "Diseño, Front-End y Creatividad",
    description: "Herramientas de interfaz, composición visual y 3D.",
    tools: [
      {
        name: "Gamma",
        description: "Generación de presentaciones, pitch decks y documentos visuales con IA.",
        url: "https://gamma.app/",
        tags: ["Presentaciones", "Generativo"],
        category: "Diseño",
        featured: false,
        type: "tool"
      },
      {
        name: "Stitch",
        description: "Herramienta de Google para diseño y construcción visual de interfaces.",
        url: "#",
        tags: ["UI", "Visual"],
        category: "Front-End",
        featured: true,
        type: "platform"
      },
      {
        name: "Spline",
        description: "Diseño 3D interactivo y experiencias visuales WebGL/Web3.",
        url: "https://spline.design/",
        tags: ["3D", "WebGL"],
        category: "Diseño 3D",
        featured: true,
        type: "tool"
      },
      {
        name: "Mixboard",
        description: "Herramienta de composición y mezcla avanzada de imágenes.",
        url: "#",
        tags: ["Composición", "Imágenes"],
        category: "Creatividad",
        featured: false,
        type: "tool"
      },
      {
        name: "Cutout Pro",
        description: "Remoción automática de fondos y procesamiento inteligente de imágenes.",
        url: "https://www.cutout.pro/es/remove-background/upload",
        tags: ["Utilidad", "Imágenes"],
        category: "Edición",
        featured: false,
        type: "tool"
      },
      {
        name: "iLoveIMG",
        description: "Suite online para edición, recorte y optimización de imágenes.",
        url: "https://www.iloveimg.com/es/recortar-imagen",
        tags: ["Utilidad", "Optimización"],
        category: "Edición",
        featured: false,
        type: "tool"
      },
      {
        name: "Lumina AI",
        description: "Herramienta de generación y procesamiento creativo mediante inteligencia artificial.",
        url: "#",
        tags: ["IA", "Creatividad"],
        category: "Generación",
        featured: false,
        type: "ai"
      }
    ]
  },
  {
    id: "video-multimedia",
    title: "Video, Multimedia y Generación Visual",
    description: "Modelos generativos de video y recursos audiovisuales.",
    tools: [
      {
        name: "Veo 3",
        description: "Modelo generativo de video IA para creación cinematográfica y contenido avanzado.",
        url: "#",
        tags: ["Video", "Generativo"],
        category: "Cine",
        featured: true,
        type: "ai"
      },
      {
        name: "Video Templates",
        description: "Marketplace de templates y recursos visuales para Sony Vegas y edición multimedia.",
        url: "https://shockprod.sellfy.store/",
        tags: ["Templates", "Edición"],
        category: "Recursos",
        featured: false,
        type: "store"
      },
      {
        name: "Nano Banana 3",
        description: "Herramienta experimental/generativa para contenido multimedia y automatización visual.",
        url: "#",
        tags: ["Experimental", "Visual"],
        category: "Generación",
        featured: false,
        type: "ai"
      }
    ]
  },
  {
    id: "research-ml",
    title: "Investigación, Datos y Machine Learning",
    description: "Análisis documental y síntesis inteligente.",
    tools: [
      {
        name: "NotebookLM 2026",
        description: "Análisis documental, investigación contextual y síntesis inteligente.",
        url: "https://notebooklm.google.com/",
        tags: ["Investigación", "Datos"],
        category: "Análisis",
        featured: true,
        type: "ai"
      }
    ]
  },
  {
    id: "web3-crypto",
    title: "Plataformas Web3 y Ecosistema Cripto",
    description: "Plataformas de análisis y monitoreo blockchain.",
    tools: [
      {
        name: "Crypto Admin",
        description: "Plataforma de análisis y monitoreo de mercado de criptomonedas.",
        url: "https://crypto-admin-web.vercel.app/",
        tags: ["Crypto", "Dashboard"],
        category: "Monitoreo",
        featured: true,
        type: "platform"
      }
    ]
  }
];
