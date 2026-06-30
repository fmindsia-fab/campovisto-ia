'use client'

import { useRef, useState } from 'react'
import { Upload, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { ImageTypeSelector } from './image-type-selector'

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

type Step = 'select-files' | 'select-type' | 'uploading'

export function ImageUploader({ inspectionId, onUploaded }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FilePreview[]>([])
  const [imageType, setImageType] = useState('')
  const [step, setStep] = useState<Step>('select-files')

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const previews: FilePreview[] = Array.from(incoming)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({ file, preview: URL.createObjectURL(file), uploading: false }))
    setFiles((prev) => [...prev, ...previews])
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleUploadWithType(type: string) {
    if (files.length === 0) return
    setStep('uploading')

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from('inspection_images')
        .insert({
          inspection_id: inspectionId,
          storage_path: `drone-images/${path}`,
          original_name: file.name,
          image_type: type || null,
          order_index: i,
        })

      if (dbError) {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, uploading: false, error: dbError.message } : f))
        continue
      }

      uploadedCount++
      setFiles((prev) => prev.filter((_, idx) => idx !== i))
    }

    if (uploadedCount > 0) onUploaded()
    else setStep('select-type')
  }

  // Step 1: selecionar arquivos
  if (step === 'select-files') {
    return (
      <div className="space-y-4">
        <div
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
            files.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={(e) => { e.preventDefault() }}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Arraste imagens ou clique para selecionar</p>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP · múltiplos arquivos · RGB ou mapas NDVI</p>
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
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {files.map((f, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border bg-muted aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.preview} alt={f.file.name} className="h-full w-full object-cover" />
                  {!f.uploading && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(i) }}
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
              <p className="text-sm text-muted-foreground">{files.length} imagem(ns) selecionada(s)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setFiles([])}>
                  Limpar
                </Button>
                <Button size="sm" onClick={() => setStep('select-type')} className="gap-1.5">
                  Próximo
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Step 2: selecionar tipo
  if (step === 'select-type') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Qual o tipo dessas imagens?</p>
            <p className="text-xs text-muted-foreground mt-0.5">{files.length} imagem(ns) · selecione o tipo para guiar a análise por IA</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep('select-files')}>
            Voltar
          </Button>
        </div>

        <ImageTypeSelector value={imageType} onChange={setImageType} />

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => { setImageType(''); setStep('uploading'); handleUploadWithType('') }} className="text-xs">
            Pular (sem tipo)
          </Button>
          <Button size="sm" onClick={() => handleUploadWithType(imageType)} className="flex-1">
            {imageType ? `Enviar como ${imageType.toUpperCase()}` : 'Selecione um tipo acima'}
          </Button>
        </div>
      </div>
    )
  }

  // Step 3: uploading
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Enviando imagens...</p>
    </div>
  )
}
