import React from 'react'
import ByteByteGoWorkbench from './ByteByteGoWorkbench'

export interface ByteByteGoDiagramProps {
  systemId: string
  variant?: 'preview' | 'workbench'
  onOpenWorkbench?: () => void
  allowSystemSwitch?: boolean
}

export default function ByteByteGoDiagram({
  systemId,
  variant = 'workbench',
  onOpenWorkbench,
  allowSystemSwitch = true
}: ByteByteGoDiagramProps) {
  return (
    <ByteByteGoWorkbench
      systemId={systemId}
      variant={variant}
      onOpenWorkbench={onOpenWorkbench}
      allowSystemSwitch={allowSystemSwitch}
    />
  )
}
