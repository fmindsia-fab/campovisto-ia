'use client'

import { useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateAvatar } from '@/lib/profiles/actions'

interface Props {
  userId: string
  avatarUrl: string | null
  initials: string
}

export function AvatarUploader({ userId, avatarUrl, initials }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(avatarUrl)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setUploading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const ext = file.name.split('.').pop()
    const path = `${userId}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) {
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    await updateAvatar(data.publicUrl)
    setPreview(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        {preview && <AvatarImage src={preview} alt="Avatar" />}
        <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">{initials}</AvatarFallback>
      </Avatar>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          {uploading ? 'Enviando...' : 'Alterar foto'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  )
}
