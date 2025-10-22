import { createBrowserClient } from '@supabase/ssr'

// Получаем переменные окружения для клиентской стороны Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Создаем клиент Supabase для браузера
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type { User, Session } from '@supabase/supabase-js'