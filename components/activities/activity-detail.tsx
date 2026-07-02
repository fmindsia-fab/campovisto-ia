'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { deleteActivity, type ActivityWithRelations } from '@/lib/activities/actions'
import { getComments, createComment, type CommentWithAuthor } from '@/lib/activity-comments/actions'

const CATEGORY_LABELS: Record<string, string> = {
  fence: 'Cerca', waterer: 'Bebedouro', pasture: 'Pastagem', soil: 'Solo',
  livestock: 'Rebanho', water: 'Água', structure: 'Estrutura', inspection: 'Vistoria', other: 'Outro',
}
const PRIORITY_LABELS: Record<string, string> = { high: 'Alta', medium: 'Média', low: 'Baixa' }

interface Props {
  activity: ActivityWithRelations
  onClose: () => void
  onEdit: () => void
}

export function ActivityDetail({ activity, onClose, onEdit }: Props) {
  const router = useRouter()
  const [comments, setComments] = useState<CommentWithAuthor[]>([])
  const [newComment, setNewComment] = useState('')
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getComments(activity.id).then(setComments)
  }, [activity.id])

  async function handleSendComment() {
    if (!newComment.trim()) return
    setSending(true)
    const result = await createComment(activity.id, newComment)
    if (!result.error) {
      setNewComment('')
      getComments(activity.id).then(setComments)
    }
    setSending(false)
  }

  async function handleDelete() {
    if (!confirm('Excluir esta atividade?')) return
    setDeleting(true)
    const result = await deleteActivity(activity.id)
    if (result.error) {
      alert(`Erro ao excluir: ${result.error}`)
      setDeleting(false)
    } else {
      onClose()
      router.refresh()
    }
  }

  const property = activity.inspections?.properties

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activity.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{PRIORITY_LABELS[activity.priority]}</Badge>
            {activity.category && <Badge variant="secondary">{CATEGORY_LABELS[activity.category] ?? activity.category}</Badge>}
            {activity.due_date && (
              <Badge variant="outline">
                Prazo: {new Date(activity.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </Badge>
            )}
            {activity.status === 'done' && activity.completed_at && (
              <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                Entregue em {new Date(activity.completed_at).toLocaleDateString('pt-BR')}
              </Badge>
            )}
          </div>

          {property && (
            <p className="text-sm text-muted-foreground">
              Propriedade: <span className="text-foreground">{property.name}</span>
              {property.clients && <span> · {property.clients.name}</span>}
            </p>
          )}

          {activity.assigned_profile?.full_name && (
            <p className="text-sm text-muted-foreground">
              Responsável: <span className="text-foreground">{activity.assigned_profile.full_name}</span>
            </p>
          )}

          {activity.description && (
            <p className="text-sm leading-relaxed rounded-md bg-muted/40 p-3">{activity.description}</p>
          )}

          <div className="flex gap-2 border-t pt-3">
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="gap-1.5 text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </Button>
          </div>

          {/* Comentários */}
          <div className="space-y-3 border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Comentários ({comments.length})
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="rounded-md bg-muted/40 p-2.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-medium">{c.profiles?.full_name ?? 'Usuário'}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(c.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum comentário ainda.</p>
              )}
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Adicionar comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="text-xs"
              />
              <Button size="icon" onClick={handleSendComment} disabled={sending || !newComment.trim()} className="shrink-0">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
