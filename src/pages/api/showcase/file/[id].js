import fs from 'fs'
import { requireApiAuth } from '@/lib/requireAuthorizedUser'
import {
  readCatalog,
  getPrivateFilePath,
  verifySignedFileToken,
} from '@/lib/showcaseStore'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Método no permitido.' })
  }

  const user = await requireApiAuth(req, res)
  if (!user) return

  const { id, mode = 'download', token = '' } = req.query

  if (!verifySignedFileToken(String(token), String(id), user.email)) {
    return res.status(403).json({
      error: 'Enlace temporal inválido o expirado. Recargue la biblioteca Showcase.',
    })
  }

  const catalog = readCatalog()
  const item = catalog.find((entry) => entry.id === id)
  if (!item || !item.storageFileName) {
    return res.status(404).json({ error: 'Archivo privado no encontrado.' })
  }

  const filePath = getPrivateFilePath(item.storageFileName)
  if (!filePath) {
    return res.status(404).json({ error: 'El recurso físico no se encuentra en el almacén seguro.' })
  }

  const stat = fs.statSync(filePath)
  const safeDownloadName = (item.originalFileName || item.storageFileName).replace(/["\r\n]/g, '')
  const disposition = mode === 'inline' && item.previewable ? 'inline' : 'attachment'

  res.setHeader('Content-Type', item.mimeType || 'application/octet-stream')
  res.setHeader('Content-Length', stat.size)
  res.setHeader(
    'Content-Disposition',
    `${disposition}; filename="${encodeURIComponent(safeDownloadName)}"`
  )
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'self'"
  )

  const stream = fs.createReadStream(filePath)
  stream.pipe(res)
}

