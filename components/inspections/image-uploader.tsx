'use client'

import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

interface ImageUploaderProps {
  inspectionId: string
  onUploaded: () => void
}

interface FilePreview {
  file: File
  preview: string
  uploading: boolean
  error?: string
}


export function ImageUploader({ inspectionId, onUploaded }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FilePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const previews: FilePreview[] = Array.from(incoming)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
      }))
    setFiles((prev) => [...prev, ...previews])
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleUpload() {
    if (files.length === 0) return
    setUploading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let uploadedCount = 0
    for (let i = 0; i < files.length; i++) {
      const { file } = files[i]
      setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, uploading: true } : f))

      const ext = file.name.split('.').pop()
      const path = `${inspectionId}/${crypto.randomUUID()}.${ext}`

      const { error: storageError } = await supabase.storage
        .from('drone-images')
        .upload(path, file, { upsert: false })

      if (storageError) {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, uploading: false, error: storageError.message } : f))
        continue
      }

      const { error: dbError } = await supabase
        .from('inspection_images')
        .insert({
          inspection_id: inspectionId,
          storage_path: `drone-images/${path}`,
          original_name: file.name,
          order_index: i,
        })

      if (dbError) {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, uploading: false, error: dbError.message } : f))
        continue
      }

      uploadedCount++
      setFiles((prev) => prev.filter((_, idx) => idx !== i))
    }

    setUploading(false)
    if (uploadedCount > 0) onUploaded()
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">Arraste imagens ou clique para selecionar</p>
        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP · múltiplos arquivos</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {files.map((f, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border bg-muted aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.preview} alt={f.file.name} className="h-full w-full object-cover" />
                {f.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
                {f.error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-destructive/80 p-2">
                    <p className="text-xs text-white text-center">{f.error}</p>
                  </div>
                )}
                {!f.uploading && !f.error && (
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                <p className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                  {f.file.name}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{files.length} imagem(ns) pronta(s)</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setFiles([])} disabled={uploading}>
                Limpar
              </Button>
              <Button size="sm" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Enviando...' : `Enviar ${files.length} imagem(ns)`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
