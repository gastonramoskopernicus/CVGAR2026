import crypto from 'crypto'
import { requireApiAuth } from '@/lib/requireAuthorizedUser'
import {
  readCatalog,
  writeCatalog,
  appendAuditLog,
  readAuditLogs,
  validateAndSavePrivateFile,
  deletePrivateFile,
  createSignedFileToken,
} from '@/lib/showcaseStore'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '36mb',
    },
  },
}

function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/
  )
  return match ? match[1] : null
}

function decorateWithSignedUrls(items, actorEmail) {
  return items.map((item) => {
    if (!item.storageFileName) return item
    const token = createSignedFileToken(item.id, actorEmail, 1800)
    return {
      ...item,
      previewUrl: `/api/showcase/file/${encodeURIComponent(item.id)}?mode=inline&token=${encodeURIComponent(token)}`,
      downloadUrl: `/api/showcase/file/${encodeURIComponent(item.id)}?mode=download&token=${encodeURIComponent(token)}`,
    }
  })
}

export default async function handler(req, res) {
  const user = await requireApiAuth(req, res)
  if (!user) return

  if (req.method === 'GET') {
    const items = decorateWithSignedUrls(readCatalog(), user.email)
    const auditLogs = readAuditLogs(20)
    return res.status(200).json({ items, auditLogs })
  }

  if (req.method === 'POST') {
    try {
      const {
        title,
        description = '',
        category = 'Conferencias y Disertaciones',
        tags = [],
        sourceType = 'file', // 'file' | 'video' | 'link'
        externalUrl = '',
        filePayload = null, // { originalName, mimeType, base64Data }
      } = req.body || {}

      const cleanTitle = String(title || '').trim()
      if (!cleanTitle) {
        return res.status(400).json({ error: 'El título del material es obligatorio.' })
      }

      const normalizedTags = Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 12)
        : String(tags || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 12)

      let fileMeta = {
        storageFileName: null,
        originalFileName: null,
        mimeType: null,
        sizeBytes: null,
        kind: sourceType === 'video' ? 'Enlace a Video' : 'Enlace / Documento',
        previewable: false,
      }

      let youtubeId = null
      let safeExternalUrl = null

      if (sourceType === 'file') {
        if (!filePayload || !filePayload.base64Data) {
          return res.status(400).json({ error: 'Debe adjuntar un archivo válido.' })
        }
        fileMeta = validateAndSavePrivateFile(filePayload)
      } else {
        const rawUrl = String(externalUrl || '').trim()
        if (!rawUrl || !/^https?:\/\//i.test(rawUrl)) {
          return res
            .status(400)
            .json({ error: 'Debe ingresar una URL válida (https://...) para enlaces o videos.' })
        }
        safeExternalUrl = rawUrl
        youtubeId = extractYouTubeId(rawUrl)
        if (youtubeId) {
          fileMeta.kind = 'Enlace a Video'
          fileMeta.previewable = true
          fileMeta.mimeType = 'video/youtube'
        }
      }

      const now = new Date().toISOString()
      const newItem = {
        id: crypto.randomUUID(),
        title: cleanTitle.slice(0, 180),
        description: String(description || '').trim().slice(0, 1200),
        category: String(category || 'General').trim().slice(0, 80),
        tags: normalizedTags,
        kind: fileMeta.kind,
        sourceType,
        externalUrl: safeExternalUrl,
        youtubeId,
        storageFileName: fileMeta.storageFileName,
        originalFileName: fileMeta.originalFileName,
        mimeType: fileMeta.mimeType,
        sizeBytes: fileMeta.sizeBytes,
        previewable: fileMeta.previewable,
        createdAt: now,
        updatedAt: now,
        sharing: {
          enabled: false,
          shareToken: null,
          expiresAt: null,
        },
      }

      const catalog = readCatalog()
      catalog.unshift(newItem)
      writeCatalog(catalog)

      appendAuditLog({
        action: 'CREATE',
        itemId: newItem.id,
        title: newItem.title,
        actorEmail: user.email,
        details: `Tipo: ${newItem.kind} | Categoría: ${newItem.category}`,
      })

      return res.status(201).json({
        item: decorateWithSignedUrls([newItem], user.email)[0],
        auditLogs: readAuditLogs(20),
      })
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Error al registrar el material.' })
    }
  }

  if (req.method === 'PUT') {
    const { id, title, description, category, tags } = req.body || {}
    if (!id) {
      return res.status(400).json({ error: 'Identificador de material requerido.' })
    }

    const catalog = readCatalog()
    const idx = catalog.findIndex((item) => item.id === id)
    if (idx === -1) {
      return res.status(404).json({ error: 'Material no encontrado.' })
    }

    const cleanTitle = String(title || '').trim()
    if (!cleanTitle) {
      return res.status(400).json({ error: 'El título no puede estar vacío.' })
    }

    const normalizedTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 12)
      : String(tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 12)

    catalog[idx] = {
      ...catalog[idx],
      title: cleanTitle.slice(0, 180),
      description: String(description ?? catalog[idx].description).trim().slice(0, 1200),
      category: String(category || catalog[idx].category).trim().slice(0, 80),
      tags: normalizedTags,
      updatedAt: new Date().toISOString(),
    }

    writeCatalog(catalog)
    appendAuditLog({
      action: 'UPDATE',
      itemId: id,
      title: catalog[idx].title,
      actorEmail: user.email,
      details: `Edición de metadatos (${catalog[idx].category})`,
    })

    return res.status(200).json({
      item: decorateWithSignedUrls([catalog[idx]], user.email)[0],
      auditLogs: readAuditLogs(20),
    })
  }

  if (req.method === 'DELETE') {
    const id = req.query.id || req.body?.id
    if (!id) {
      return res.status(400).json({ error: 'Identificador de material requerido.' })
    }

    const catalog = readCatalog()
    const target = catalog.find((item) => item.id === id)
    if (!target) {
      return res.status(404).json({ error: 'Material no encontrado.' })
    }

    if (target.storageFileName) {
      deletePrivateFile(target.storageFileName)
    }

    const updated = catalog.filter((item) => item.id !== id)
    writeCatalog(updated)

    appendAuditLog({
      action: 'DELETE',
      itemId: id,
      title: target.title,
      actorEmail: user.email,
      details: `Eliminado (${target.kind})`,
    })

    return res.status(200).json({
      deletedId: id,
      auditLogs: readAuditLogs(20),
    })
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
  return res.status(405).json({ error: `Método ${req.method} no permitido.` })
}

