import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB

const ALLOWED_TYPES = {
  '.pdf': {
    mimes: ['application/pdf'],
    kind: 'PDF',
    previewable: true,
    magicCheck: (buf) => buf.length >= 4 && buf.slice(0, 4).toString('ascii') === '%PDF',
  },
  '.pptx': {
    mimes: [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/octet-stream',
    ],
    kind: 'PPTX',
    previewable: false,
    magicCheck: (buf) => buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b,
  },
  '.ppt': {
    mimes: ['application/vnd.ms-powerpoint', 'application/octet-stream'],
    kind: 'PPTX',
    previewable: false,
    magicCheck: (buf) => buf.length >= 8 && buf[0] === 0xd0 && buf[1] === 0xcf,
  },
  '.png': {
    mimes: ['image/png'],
    kind: 'Imagen',
    previewable: true,
    magicCheck: (buf) =>
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47,
  },
  '.jpg': {
    mimes: ['image/jpeg'],
    kind: 'Imagen',
    previewable: true,
    magicCheck: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  '.jpeg': {
    mimes: ['image/jpeg'],
    kind: 'Imagen',
    previewable: true,
    magicCheck: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  '.webp': {
    mimes: ['image/webp'],
    kind: 'Imagen',
    previewable: true,
    magicCheck: (buf) =>
      buf.length >= 12 &&
      buf.slice(0, 4).toString('ascii') === 'RIFF' &&
      buf.slice(8, 12).toString('ascii') === 'WEBP',
  },
  '.docx': {
    mimes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream',
    ],
    kind: 'Documento',
    previewable: false,
    magicCheck: (buf) => buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b,
  },
  '.xlsx': {
    mimes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream',
    ],
    kind: 'Documento',
    previewable: false,
    magicCheck: (buf) => buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b,
  },
}

function resolveStorageRoot() {
  const localDir = path.join(process.cwd(), '.storage', 'showcase')
  try {
    fs.mkdirSync(path.join(localDir, 'files'), { recursive: true })
    return localDir
  } catch {
    const tmpDir = path.join('/tmp', 'gar-showcase')
    fs.mkdirSync(path.join(tmpDir, 'files'), { recursive: true })
    return tmpDir
  }
}

const STORAGE_ROOT = resolveStorageRoot()
const FILES_DIR = path.join(STORAGE_ROOT, 'files')
const CATALOG_PATH = path.join(STORAGE_ROOT, 'catalog.json')
const AUDIT_LOG_PATH = path.join(STORAGE_ROOT, 'audit.log.json')

const INITIAL_SEED_ITEMS = [
  {
    id: 'seed-posgrado-uba-2026',
    title: 'Insurtech y futuro de las compañías de seguros — Posgrado UBA 2026',
    description:
      'Material base y estructura temática de la disertación académica en el Posgrado en Derecho de Seguros (Facultad de Derecho, Universidad de Buenos Aires).',
    category: 'Conferencias y Posgrados',
    tags: ['Insurtech', 'UBA', 'Estrategia', 'Futuro del Seguro'],
    kind: 'Presentación / Referencia',
    sourceType: 'link',
    externalUrl: 'https://www.linkedin.com/in/ramosgaston/',
    storageFileName: null,
    originalFileName: null,
    mimeType: null,
    sizeBytes: null,
    previewable: false,
    createdAt: '2026-03-15T12:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
    /* Preparado para futuro uso compartido mediante enlaces controlados (deshabilitado en V2.2) */
    sharing: {
      enabled: false,
      shareToken: null,
      expiresAt: null,
    },
  },
  {
    id: 'seed-seminario-latam-12',
    title: 'Mesa de Innovación Tecnológica — 12.º Seminario Latinoamericano de Seguros y Reaseguros',
    description:
      'Síntesis ejecutiva y ejes de debate sobre modernización tecnológica, urbanización de sistemas core e inteligencia artificial aplicada.',
    category: 'Paneles Ejecutivos',
    tags: ['Innovación', 'Transformación Digital', 'Core Systems', 'LatAm'],
    kind: 'Presentación / Referencia',
    sourceType: 'link',
    externalUrl: 'https://www.linkedin.com/feed/update/urn:li:activity:7469802818644918272/',
    storageFileName: null,
    originalFileName: null,
    mimeType: null,
    sizeBytes: null,
    previewable: false,
    createdAt: '2026-06-10T15:30:00.000Z',
    updatedAt: '2026-06-10T15:30:00.000Z',
    sharing: {
      enabled: false,
      shareToken: null,
      expiresAt: null,
    },
  },
  {
    id: 'seed-video-entrevista-kopernicus',
    title: 'Entrevista: Cómo cambiar la industria del seguro desde adentro',
    description:
      'Grabación audiovisual completa (12:42 min) analizando arquitectura empresarial, coexistencia con sistemas legacy y aceleración digital.',
    category: 'Multimedia y Entrevistas',
    tags: ['Video', 'Arquitectura', 'Kopernicus Tech'],
    kind: 'Enlace a Video',
    sourceType: 'video',
    externalUrl: 'https://www.youtube.com/watch?v=PtV9EF4u7T4',
    youtubeId: 'PtV9EF4u7T4',
    storageFileName: null,
    originalFileName: null,
    mimeType: 'video/youtube',
    sizeBytes: null,
    previewable: true,
    createdAt: '2026-05-20T10:00:00.000Z',
    updatedAt: '2026-05-20T10:00:00.000Z',
    sharing: {
      enabled: false,
      shareToken: null,
      expiresAt: null,
    },
  },
]

export function readCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(INITIAL_SEED_ITEMS, null, 2), 'utf-8')
    return INITIAL_SEED_ITEMS
  }
  try {
    const raw = fs.readFileSync(CATALOG_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_ITEMS
  } catch {
    return INITIAL_SEED_ITEMS
  }
}

export function writeCatalog(items) {
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(items, null, 2), 'utf-8')
}

export function appendAuditLog({ action, itemId, title, actorEmail, details = '' }) {
  let logs = []
  if (fs.existsSync(AUDIT_LOG_PATH)) {
    try {
      logs = JSON.parse(fs.readFileSync(AUDIT_LOG_PATH, 'utf-8'))
      if (!Array.isArray(logs)) logs = []
    } catch {
      logs = []
    }
  }
  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action, // 'CREATE' | 'UPDATE' | 'DELETE'
    itemId,
    title: String(title || '').slice(0, 160),
    actorEmail: String(actorEmail || 'unknown'),
    details: String(details || '').slice(0, 300),
  }
  logs.unshift(entry)
  // Conservar últimos 500 eventos
  fs.writeFileSync(AUDIT_LOG_PATH, JSON.stringify(logs.slice(0, 500), null, 2), 'utf-8')
  return entry
}

export function readAuditLogs(limit = 25) {
  if (!fs.existsSync(AUDIT_LOG_PATH)) return []
  try {
    const logs = JSON.parse(fs.readFileSync(AUDIT_LOG_PATH, 'utf-8'))
    return Array.isArray(logs) ? logs.slice(0, limit) : []
  } catch {
    return []
  }
}

export function validateAndSavePrivateFile({ originalName, mimeType, base64Data }) {
  if (!originalName || !base64Data) {
    throw new Error('Archivo inválido o vacío.')
  }

  const cleanOriginalName = path.basename(String(originalName)).replace(/[^\w.\- ()áéíóúÁÉÍÓÚñÑ]/g, '_')
  const ext = path.extname(cleanOriginalName).toLowerCase()

  const spec = ALLOWED_TYPES[ext]
  if (!spec) {
    throw new Error(
      `Extensión "${ext || 'desconocida'}" no autorizada. Formatos permitidos: PDF, PPTX, PNG, JPG, WEBP, DOCX, XLSX.`
    )
  }

  const normalizedMime = String(mimeType || '').toLowerCase().trim()
  if (normalizedMime && !spec.mimes.includes(normalizedMime)) {
    throw new Error(`Tipo MIME "${normalizedMime}" no coincide con el formato ${ext}.`)
  }

  const base64Clean = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data
  const buffer = Buffer.from(base64Clean, 'base64')

  if (buffer.length === 0) {
    throw new Error('El archivo subido está vacío.')
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error('El archivo supera el límite máximo permitido de 25 MB.')
  }

  if (!spec.magicCheck(buffer)) {
    throw new Error(
      `La firma binaria del archivo no corresponde a un documento ${spec.kind} válido.`
    )
  }

  const storageFileName = `${crypto.randomUUID()}${ext}`
  const fullPath = path.join(FILES_DIR, storageFileName)
  fs.writeFileSync(fullPath, buffer, { mode: 0o600 })

  return {
    storageFileName,
    originalFileName: cleanOriginalName,
    mimeType: spec.mimes[0],
    sizeBytes: buffer.length,
    kind: spec.kind,
    previewable: spec.previewable,
  }
}

export function getPrivateFilePath(storageFileName) {
  if (!storageFileName || typeof storageFileName !== 'string') return null
  const safeName = path.basename(storageFileName)
  if (safeName !== storageFileName || safeName.includes('..')) return null
  const fullPath = path.join(FILES_DIR, safeName)
  if (!fs.existsSync(fullPath)) return null
  return fullPath
}

export function deletePrivateFile(storageFileName) {
  const fullPath = getPrivateFilePath(storageFileName)
  if (fullPath && fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
  }
}

export function createSignedFileToken(itemId, actorEmail, ttlSeconds = 900) {
  const secret = process.env.NEXTAUTH_SECRET || 'gar-showcase-fallback-dev-secret'
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const payload = `${itemId}:${actorEmail}:${exp}`
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return `${exp}.${sig}`
}

export function verifySignedFileToken(token, itemId, actorEmail) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false
  const [expStr, sig] = token.split('.')
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false

  const secret = process.env.NEXTAUTH_SECRET || 'gar-showcase-fallback-dev-secret'
  const payload = `${itemId}:${actorEmail}:${exp}`
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))
  } catch {
    return false
  }
}
