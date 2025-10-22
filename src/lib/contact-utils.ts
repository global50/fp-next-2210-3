import { Mail, Phone, MessageCircle, Globe, Github, Linkedin, Twitter, Link as LinkIcon } from "lucide-react"
// import { Video as LucideIcon } from "lucide-react"
import { ContactInfoEntry } from "@/types/profile"

export interface ContactTypeConfig {
  value: ContactInfoEntry['type']
  label: string
  icon: any /* LucideIcon */
  urlPrefix?: string
  placeholder: string
  validateValue: (value: string) => boolean
  formatValue: (value: string) => string
}

export const CONTACT_TYPES: ContactTypeConfig[] = [
  {
    value: 'phone',
    label: 'Phone',
    icon: Phone,
    placeholder: '+1234567890',
    validateValue: (value: string) => {
      const cleaned = value.replace(/[\s\-\(\)]/g, '')
      return /^[\+]?[0-9]{10,15}$/.test(cleaned)
    },
    formatValue: (value: string) => value.trim()
  },
  {
    value: 'email',
    label: 'Email',
    icon: Mail,
    placeholder: 'email@example.com',
    validateValue: (value: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },
    formatValue: (value: string) => value.trim().toLowerCase()
  },
  {
    value: 'telegram',
    label: 'Telegram',
    icon: MessageCircle,
    urlPrefix: 'https://t.me/',
    placeholder: 'username (5-32 characters)',
    validateValue: (value: string) => {
      return /^[a-zA-Z0-9_]{5,32}$/.test(value.replace('@', ''))
    },
    formatValue: (value: string) => value.replace('@', '').trim()
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    urlPrefix: 'https://wa.me/',
    placeholder: '1234567890',
    validateValue: (value: string) => {
      const cleaned = value.replace(/[\s\-\(\)\+]/g, '')
      return /^[0-9]{10,15}$/.test(cleaned)
    },
    formatValue: (value: string) => value.replace(/[\s\-\(\)\+]/g, '').trim()
  },
  {
    value: 'github',
    label: 'GitHub',
    icon: Github,
    urlPrefix: 'https://github.com/',
    placeholder: 'username',
    validateValue: (value: string) => {
      return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,38}[a-zA-Z0-9])?$/.test(value)
    },
    formatValue: (value: string) => value.trim()
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    urlPrefix: 'https://linkedin.com/in/',
    placeholder: 'username',
    validateValue: (value: string) => {
      return /^[a-zA-Z0-9-]{3,100}$/.test(value)
    },
    formatValue: (value: string) => value.trim()
  },
  {
    value: 'twitter',
    label: 'Twitter',
    icon: Twitter,
    urlPrefix: 'https://twitter.com/',
    placeholder: 'username',
    validateValue: (value: string) => {
      return /^[a-zA-Z0-9_]{1,15}$/.test(value.replace('@', ''))
    },
    formatValue: (value: string) => value.replace('@', '').trim()
  },
  {
    value: 'website',
    label: 'Website',
    icon: Globe,
    urlPrefix: 'https://',
    placeholder: 'example.com',
    validateValue: (value: string) => {
      const urlPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/
      const cleanValue = value.replace(/^https?:\/\//, '')
      return urlPattern.test(cleanValue)
    },
    formatValue: (value: string) => value.replace(/^https?:\/\//, '').trim()
  },
  {
    value: 'link',
    label: 'Link',
    icon: LinkIcon,
    urlPrefix: 'https://',
    placeholder: 'example.com',
    validateValue: (value: string) => {
      const urlPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/
      const cleanValue = value.replace(/^https?:\/\//, '')
      return urlPattern.test(cleanValue)
    },
    formatValue: (value: string) => value.replace(/^https?:\/\//, '').trim()
  },
]

export function getContactTypeConfig(type: ContactInfoEntry['type']): ContactTypeConfig | undefined {
  return CONTACT_TYPES.find(ct => ct.value === type)
}

export function getContactIcon(type: ContactInfoEntry['type']): any /* : LucideIcon */ {
  const config = getContactTypeConfig(type)
  return config?.icon || Globe
}

export function generateContactLink(entry: ContactInfoEntry): string {
  if (entry.type === 'phone') {
    if (entry.is_whatsapp) {
      const cleanNumber = entry.value.replace(/[\s\-\(\)\+]/g, '')
      return `https://wa.me/${cleanNumber}`
    }
    return `tel:${entry.value}`
  }

  if (entry.type === 'email') {
    return `mailto:${entry.value}`
  }

  const config = getContactTypeConfig(entry.type)
  if (config?.urlPrefix) {
    return `${config.urlPrefix}${entry.value}`
  }

  return entry.value.startsWith('http') ? entry.value : `https://${entry.value}`
}

export function getContactDisplayValue(entry: ContactInfoEntry): string {
  if (entry.label) {
    return entry.label
  }

  if (entry.type === 'phone' || entry.type === 'email' || entry.type === 'whatsapp') {
    return entry.value
  }

  const config = getContactTypeConfig(entry.type)
  return config?.label || entry.value
}

export function validateContactEntry(entry: Partial<ContactInfoEntry>): string | null {
  if (!entry.type) {
    return 'Contact type is required'
  }

  if (!entry.value || !entry.value.trim()) {
    return 'Contact value is required'
  }

  const config = getContactTypeConfig(entry.type)
  if (!config) {
    return 'Invalid contact type'
  }

  if (!config.validateValue(entry.value)) {
    if (entry.type === 'telegram') {
      return 'Telegram username must be 5-32 characters (letters, numbers, underscores)'
    }
    return `Invalid ${config.label.toLowerCase()} format`
  }

  return null
}
