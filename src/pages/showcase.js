import Head from 'next/head'
import { useState, useMemo } from 'react'
import PrivateAuthGate, { PrivateSessionBar } from '@/components/PrivateAuthGate'
import GARIcon from '@/components/GARIcon'
import Monogram from '@/components/Monogram'
import { getAuthorizedSession } from '@/lib/requireAuthorizedUser'
import {
  readCatalog,
  readAuditLogs,
  createSignedFileToken,
} from '@/lib/showcaseStore'
import styles from '@/styles/Showcase.module.css'

function formatBytes(bytes) {
  if (!bytes || !Number.isFinite(bytes)) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function ShowcasePage({
  initialItems = [],
  initialAuditLogs = [],
  authenticated = false,
  authorized = false,
  oauthConfigured = true,
  user = null,
}) {
  const [items, setItems] = useState(initialItems)
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Todos')

  // Upload / Create form state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formSourceType, setFormSourceType] = useState('file') // 'file' | 'video' | 'link'
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState('Conferencias y Posgrados')
  const [formTags, setFormTags] = useState('')
  const [formExternalUrl, setFormExternalUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')

  // Edit modal state
  const [editingItem, setEditingItem] = useState(null)

  // Preview modal state
  const [previewItem, setPreviewItem] = useState(null)

  // Delete confirmation state
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null)

  // Audit panel toggle
  const [showAudit, setShowAudit] = useState(false)

  const filterOptions = [
    'Todos',
    'PDF',
    'PPTX',
    'Imagen',
    'Enlace a Video',
    'Presentación / Referencia',
  ]

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesFilter =
        activeFilter === 'Todos' ||
        item.kind === activeFilter ||
        item.category === activeFilter

      if (!matchesFilter) return false

      const q = searchQuery.trim().toLowerCase()
      if (!q) return true

      const inTitle = (item.title || '').toLowerCase().includes(q)
      const inDesc = (item.description || '').toLowerCase().includes(q)
      const inCat = (item.category || '').toLowerCase().includes(q)
      const inTags = (item.tags || []).some((t) => t.toLowerCase().includes(q))
      return inTitle || inDesc || inCat || inTags
    })
  }, [items, activeFilter, searchQuery])

  if (!authenticated || !authorized) {
    return (
      <>
        <Head>
          <title>Showcase | GAR.</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <PrivateAuthGate
          variant="showcase"
          sectionKicker="Showcase"
          badgeLabel="CONTENIDO PRIVADO"
          sectionTitle="Bienvenido a mi Showcase"
          sectionSubtitle="En esta sección encontrarás presentaciones, demostraciones, prototipos y casos de éxito que reflejan experiencias, proyectos e iniciativas desarrolladas a lo largo de mi trayectoria profesional."
          callbackUrl="/showcase"
          accessDenied={authenticated && !authorized}
          oauthConfigured={oauthConfigured}
        />
      </>
    )
  }

  const resetCreateForm = () => {
    setFormSourceType('file')
    setFormTitle('')
    setFormDesc('')
    setFormCategory('Conferencias y Posgrados')
    setFormTags('')
    setFormExternalUrl('')
    setSelectedFile(null)
    setFeedbackError('')
  }

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'))
      reader.readAsDataURL(file)
    })

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setFeedbackError('')
    setSubmitting(true)

    try {
      let filePayload = null
      if (formSourceType === 'file') {
        if (!selectedFile) {
          throw new Error('Seleccione un archivo (PDF, PPTX, Imagen, DOCX o XLSX).')
        }
        if (selectedFile.size > 25 * 1024 * 1024) {
          throw new Error('El archivo supera el límite máximo de 25 MB.')
        }
        const base64Data = await readFileAsBase64(selectedFile)
        filePayload = {
          originalName: selectedFile.name,
          mimeType: selectedFile.type,
          base64Data,
        }
      }

      const res = await fetch('/api/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          category: formCategory,
          tags: formTags,
          sourceType: formSourceType,
          externalUrl: formExternalUrl,
          filePayload,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el material.')
      }

      setItems((prev) => [data.item, ...prev])
      if (data.auditLogs) setAuditLogs(data.auditLogs)
      resetCreateForm()
      setShowCreateModal(false)
    } catch (err) {
      setFeedbackError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingItem) return
    setFeedbackError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/showcase', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          title: editingItem.title,
          description: editingItem.description,
          category: editingItem.category,
          tags: editingItem.tagsText ?? (editingItem.tags || []).join(', '),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar el material.')
      }

      setItems((prev) => prev.map((it) => (it.id === data.item.id ? data.item : it)))
      if (data.auditLogs) setAuditLogs(data.auditLogs)
      setEditingItem(null)
    } catch (err) {
      setFeedbackError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteItem) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/showcase?id=${encodeURIComponent(confirmDeleteItem.id)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo eliminar el material.')
      }
      setItems((prev) => prev.filter((it) => it.id !== confirmDeleteItem.id))
      if (data.auditLogs) setAuditLogs(data.auditLogs)
      setConfirmDeleteItem(null)
    } catch (err) {
      setFeedbackError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Showcase — Biblioteca Privada | GAR.</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.pageWrapper}>
        <div className="container">
          <PrivateSessionBar user={user} activeSection="showcase" />

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerText}>
              <span className={styles.kicker}>Biblioteca Ejecutiva Privada</span>
              <h1 className={styles.title}>Showcase</h1>
              <p className={styles.subtitle}>
                Materiales reservados utilizados en conferencias, posgrados, presentaciones de directorio y reuniones estratégicas.
              </p>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.auditToggleBtn}
                onClick={() => setShowAudit(!showAudit)}
              >
                {showAudit ? 'Ocultar registro' : 'Registro de auditoría'}
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => {
                  resetCreateForm()
                  setShowCreateModal(true)
                }}
              >
                + Incorporar material
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className={styles.controlsBar}>
            <div className={styles.searchBox}>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, descripción, categoría o etiqueta..."
                className={styles.searchInput}
                aria-label="Buscar materiales en Showcase"
              />
            </div>

            <div className={styles.filterGroup} role="tablist" aria-label="Filtrar por tipo">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`${styles.filterBtn} ${
                    activeFilter === filter ? styles.filterActive : ''
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible Audit Log */}
          {showAudit && (
            <div className={styles.auditPanel}>
              <h2 className={styles.auditTitle}>Registro de actividad (Altas, Ediciones y Bajas)</h2>
              {auditLogs.length === 0 ? (
                <p className={styles.auditEmpty}>Sin movimientos registrados aún.</p>
              ) : (
                <ul className={styles.auditList}>
                  {auditLogs.map((log) => (
                    <li key={log.id} className={styles.auditItem}>
                      <span className={`${styles.auditBadge} ${styles[`audit_${log.action}`] || ''}`}>
                        {log.action}
                      </span>
                      <span className={styles.auditItemTitle}>{log.title}</span>
                      <span className={styles.auditMeta}>
                        {log.details} · {formatDate(log.timestamp)} · {log.actorEmail}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Materials Grid */}
          {filteredItems.length === 0 ? (
            <div className={styles.emptyState}>
              <GARIcon name="architecture" size={38} />
              <h3>No se encontraron materiales para este criterio</h3>
              <p>Utilice el botón «+ Incorporar material» para subir presentaciones PDF, PPTX, imágenes o enlaces.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredItems.map((item) => (
                <article key={item.id} className={styles.card}>
                  <div className={styles.cardVisual}>
                    {item.kind === 'Imagen' && item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt={item.title}
                        className={styles.cardThumb}
                        loading="lazy"
                      />
                    ) : item.youtubeId ? (
                      <img
                        src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                        alt={item.title}
                        className={styles.cardThumb}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.cardPlaceholder}>
                        <GARIcon
                          name={
                            item.kind === 'PDF'
                              ? 'architecture'
                              : item.kind === 'PPTX'
                              ? 'strategy'
                              : 'consulting'
                          }
                          size={38}
                        />
                        <div className={styles.watermark}>
                          <Monogram variant="inline" />
                        </div>
                      </div>
                    )}

                    <div className={styles.cardTopBadges}>
                      <span className={styles.categoryBadge}>{item.category}</span>
                      <span className={styles.kindBadge}>{item.kind}</span>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.metaRow}>
                      <span className={styles.dateText}>
                        Incorporado: {formatDate(item.createdAt)}
                      </span>
                      {item.sizeBytes && (
                        <span className={styles.sizeText}>{formatBytes(item.sizeBytes)}</span>
                      )}
                    </div>

                    <h2 className={styles.cardTitle}>{item.title}</h2>
                    {item.description && (
                      <p className={styles.cardDesc}>{item.description}</p>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <div className={styles.tagsRow}>
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className={styles.tagChip}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.primaryActions}>
                      {(item.previewable && (item.previewUrl || item.youtubeId)) && (
                        <button
                          type="button"
                          className={styles.actionBtnPrimary}
                          onClick={() => setPreviewItem(item)}
                        >
                          Vista previa
                        </button>
                      )}

                      {item.downloadUrl && (
                        <a
                          href={item.downloadUrl}
                          className={styles.actionBtnSecondary}
                        >
                          Descargar
                        </a>
                      )}

                      {item.externalUrl && (
                        <a
                          href={item.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.actionBtnSecondary}
                        >
                          Abrir enlace &rarr;
                        </a>
                      )}
                    </div>

                    <div className={styles.manageActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() =>
                          setEditingItem({
                            ...item,
                            tagsText: (item.tags || []).join(', '),
                          })
                        }
                        title="Editar título, descripción y etiquetas"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.deleteBtn}`}
                        onClick={() => setConfirmDeleteItem(item)}
                        title="Eliminar material"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create / Upload Material */}
      {showCreateModal && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Incorporar material">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2>Incorporar material a Showcase</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className={styles.form}>
              <div className={styles.sourceSwitch}>
                <button
                  type="button"
                  className={`${styles.switchBtn} ${
                    formSourceType === 'file' ? styles.switchActive : ''
                  }`}
                  onClick={() => setFormSourceType('file')}
                >
                  Subir archivo privado (PDF, PPTX, Imagen, Doc)
                </button>
                <button
                  type="button"
                  className={`${styles.switchBtn} ${
                    formSourceType === 'video' ? styles.switchActive : ''
                  }`}
                  onClick={() => setFormSourceType('video')}
                >
                  Enlace a Video / Referencia
                </button>
              </div>

              <label className={styles.label}>
                Título del material *
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej. Keynote Transformación Tecnológica 2026"
                  className={styles.input}
                />
              </label>

              <div className={styles.formRow}>
                <label className={styles.label}>
                  Categoría
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Conferencias, Directorio, Posgrados..."
                    className={styles.input}
                  />
                </label>

                <label className={styles.label}>
                  Etiquetas (separadas por coma)
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Estrategia, IA, Seguros, Arquitectura"
                    className={styles.input}
                  />
                </label>
              </div>

              <label className={styles.label}>
                Descripción ejecutiva
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Contexto del material, audiencia o notas clave..."
                  className={styles.textarea}
                />
              </label>

              {formSourceType === 'file' ? (
                <label className={styles.label}>
                  Archivo privado (Máx. 25 MB · Formatos: .pdf, .pptx, .ppt, .png, .jpg, .webp, .docx, .xlsx) *
                  <input
                    type="file"
                    accept=".pdf,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.docx,.xlsx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className={styles.fileInput}
                    required
                  />
                </label>
              ) : (
                <label className={styles.label}>
                  URL del video o recurso (https://...) *
                  <input
                    type="url"
                    required
                    value={formExternalUrl}
                    onChange={(e) => setFormExternalUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={styles.input}
                  />
                </label>
              )}

              {feedbackError && <p className={styles.errorText}>{feedbackError}</p>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                  {submitting ? 'Guardando en almacén seguro...' : 'Guardar material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Material */}
      {editingItem && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Editar material">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2>Editar material</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setEditingItem(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className={styles.form}>
              <label className={styles.label}>
                Título *
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  className={styles.input}
                />
              </label>

              <div className={styles.formRow}>
                <label className={styles.label}>
                  Categoría
                  <input
                    type="text"
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, category: e.target.value })
                    }
                    className={styles.input}
                  />
                </label>

                <label className={styles.label}>
                  Etiquetas (separadas por coma)
                  <input
                    type="text"
                    value={editingItem.tagsText}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, tagsText: e.target.value })
                    }
                    className={styles.input}
                  />
                </label>
              </div>

              <label className={styles.label}>
                Descripción
                <textarea
                  rows={3}
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  className={styles.textarea}
                />
              </label>

              {feedbackError && <p className={styles.errorText}>{feedbackError}</p>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setEditingItem(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                  {submitting ? 'Actualizando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Preview Compatible Formats */}
      {previewItem && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Vista previa">
          <div className={`${styles.modalCard} ${styles.previewModalCard}`}>
            <div className={styles.modalHeader}>
              <h2>{previewItem.title}</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setPreviewItem(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.previewContainer}>
              {previewItem.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${previewItem.youtubeId}?autoplay=1&rel=0`}
                  title={previewItem.title}
                  className={styles.previewIframe}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : previewItem.kind === 'Imagen' && previewItem.previewUrl ? (
                <img
                  src={previewItem.previewUrl}
                  alt={previewItem.title}
                  className={styles.previewImage}
                />
              ) : previewItem.kind === 'PDF' && previewItem.previewUrl ? (
                <iframe
                  src={previewItem.previewUrl}
                  title={previewItem.title}
                  className={styles.previewIframe}
                />
              ) : (
                <p>Formato sin vista previa embebida. Utilice la descarga autorizada.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {confirmDeleteItem && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2>Confirmar eliminación</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setConfirmDeleteItem(null)}
              >
                ✕
              </button>
            </div>

            <p className={styles.confirmText}>
              ¿Está seguro de que desea eliminar permanentemente{' '}
              <strong>«{confirmDeleteItem.title}»</strong> de la biblioteca privada Showcase?
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setConfirmDeleteItem(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={handleDeleteConfirm}
                disabled={submitting}
              >
                {submitting ? 'Eliminando...' : 'Sí, eliminar material'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export async function getServerSideProps(context) {
  context.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  const auth = await getAuthorizedSession(context.req, context.res)

  if (!auth.authenticated || !auth.authorized) {
    return {
      props: {
        initialItems: [],
        initialAuditLogs: [],
        authenticated: auth.authenticated,
        authorized: false,
        oauthConfigured: auth.oauthConfigured,
        user: null,
      },
    }
  }

  const rawItems = readCatalog()
  const decoratedItems = rawItems.map((item) => {
    if (!item.storageFileName) return item
    const token = createSignedFileToken(item.id, auth.user.email, 1800)
    return {
      ...item,
      previewUrl: `/api/showcase/file/${encodeURIComponent(item.id)}?mode=inline&token=${encodeURIComponent(token)}`,
      downloadUrl: `/api/showcase/file/${encodeURIComponent(item.id)}?mode=download&token=${encodeURIComponent(token)}`,
    }
  })

  return {
    props: {
      initialItems: decoratedItems,
      initialAuditLogs: readAuditLogs(20),
      authenticated: true,
      authorized: true,
      oauthConfigured: true,
      user: auth.user,
    },
  }
}

