'use client'

import { useState } from 'react'
import type { Partner } from '../lib/api'
import MediaImage from './ui/MediaImage'

/** A partner's logo, or its first two letters when there is none (or it fails
 *  to load). Shared by the card and the details dialog. */
export default function LogoOrInitials({
  partner,
  className,
  imgClassName,
  initialsClassName,
}: {
  partner: Partner
  className: string
  imgClassName: string
  initialsClassName: string
}) {
  const [imgError, setImgError] = useState(false)
  const showLogo = Boolean(partner.logo) && !imgError
  return (
    <div className={className}>
      {showLogo ? (
        <MediaImage
          src={partner.logo as string}
          alt={partner.name}
          width={320}
          height={160}
          sizes="160px"
          onGiveUp={() => setImgError(true)}
          className={imgClassName}
        />
      ) : (
        <span className={initialsClassName}>{partner.name.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  )
}
