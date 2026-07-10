'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { formatPhoneBR } from '@/lib/utils'

interface Props {
  id?: string
  name?: string
  defaultValue?: string
}

export function PhoneInput({ id = 'phone', name = 'phone', defaultValue = '' }: Props) {
  const [value, setValue] = useState(() => formatPhoneBR(defaultValue))

  return (
    <Input
      id={id}
      name={name}
      value={value}
      onChange={(e) => setValue(formatPhoneBR(e.target.value))}
      placeholder="(43) 99143-4124"
      inputMode="tel"
    />
  )
}
