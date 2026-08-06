import { useState, useRef } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, ImagePlus, Video, X, Play } from 'lucide-react'

const PB = '#0A66FF'

export interface MediaResult {
  url: string
  mime: string
  mediaType: 'image' | 'video'
  filename: string
}

interface Props {
  value: MediaResult | null
  onChange: (m: MediaResult | null) => void
  maxVideoSeconds?: number
  label?: string
}

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-m4v', 'video/3gpp']

function readVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const vid = document.createElement('video')
    vid.preload = 'metadata'
    vid.muted = true
    vid.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve({ duration: vid.duration, width: vid.videoWidth, height: vid.videoHeight }) }
    vid.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read video')) }
    vid.src = url
  })
}

export function MediaUploader({ value, onChange, maxVideoSeconds = 300, label }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const trigger = () => inputRef.current?.click()

  const handleFile = async (file: File) => {
    const mime = file.type.toLowerCase()
    const isImage = IMAGE_MIMES.includes(mime)
    const isVideo = VIDEO_MIMES.includes(mime)
    if (!isImage && !isVideo) {
      toast.error('Only photos, or mp4/webm/mov videos up to 5 minutes are supported')
      return
    }
    if (isVideo) {
      if (file.size > 400 * 1024 * 1024) {
        toast.error('Video is too large (max 400MB)')
        return
      }
      try {
        const meta = await readVideoMetadata(file)
        if (meta.duration > maxVideoSeconds) {
          toast.error(`Videos must be at most ${Math.round(maxVideoSeconds / 60)} min long (yours is ${Math.round(meta.duration)}s)`)
          return
        }
        if (meta.width > 1920 || meta.height > 1080) {
          toast.error(`Max video resolution is 1080p (1920×1080) — yours is ${meta.width}x${meta.height}`)
          return
        }
      } catch {
        toast.error('Could not read that video — please use a valid mp4/webm/mov file')
        return
      }
    }
    setUploading(true)
    try {
      const res = await api.upload(file)
      onChange({ url: res.url, mime: res.mime, mediaType: isVideo ? 'video' : 'image', filename: res.filename })
      toast.success(isVideo ? 'Video added' : 'Photo added')
    } catch (e: any) {
      toast.error(e?.error || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={`${IMAGE_MIMES.join(',')},${VIDEO_MIMES.join(',')}`}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {uploading ? (
        <div className="flex items-center gap-2 text-sm text-blue-600 py-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</div>
      ) : value ? (
        <div className="relative rounded-xl overflow-hidden bg-black">
          {value.mediaType === 'video' ? (
            <>
              <video src={value.url} controls className="w-full max-h-[420px]" preload="metadata" />
              <span className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-white bg-black/60 rounded-full px-2 py-0.5"><Play className="w-3 h-3" /> 1080p · ≤5 min</span>
            </>
          ) : (
            <img src={value.url} alt="upload" className="w-full max-h-[420px] object-cover" />
          )}
          <button onClick={() => onChange(null)} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80" title="Remove"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <button type="button" onClick={trigger} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-blue-100" style={{ color: PB, background: '#EEF4FF' }}>
          <span className="flex items-center">
            <ImagePlus className="w-4 h-4" />
            <Video className="w-4 h-4 -ml-1" />
          </span>
          {label || 'Add photo / video'}
        </button>
      )}
    </div>
  )
}