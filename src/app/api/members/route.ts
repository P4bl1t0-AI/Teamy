import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { full_name, email, password, role_label, default_days } = await request.json()

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: user, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role_label },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Mettre à jour le profil créé par le trigger avec les jours par défaut
  if (default_days && Object.keys(default_days).length > 0) {
    await supabase
      .from('profiles')
      .update({ default_days })
      .eq('user_id', user.user.id)
  }

  return NextResponse.json({ user }, { status: 201 })
}
