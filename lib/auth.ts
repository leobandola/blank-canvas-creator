"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"

export async function getUser() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  if (!session) {
    return null
  }

  try {
    const sessionData = JSON.parse(session.value)
    return sessionData
  } catch {
    return null
  }
}

export async function isAuthenticated() {
  const user = await getUser()
  return !!user
}

export async function signIn(email: string, password: string) {
  const supabase = await createServerClient()

  console.log("[v0] Attempting login for:", email)

  // Buscar admin pelo email
  const { data: admin, error } = await supabase.from("admins").select("*").eq("email", email).single()

  console.log("[v0] Admin query result:", { admin: admin ? "found" : "not found", error: error?.message })

  if (error) {
    if (error.code === "PGRST116") {
      return { error: "Usuário não encontrado. Verifique o email ou crie uma conta." }
    }
    if (error.message?.includes("does not exist")) {
      return { error: "Tabela de administradores não existe. Execute o script 007_create_admin_with_user.sql" }
    }
    return { error: `Erro ao buscar usuário: ${error.message}` }
  }

  if (!admin) {
    return { error: "Usuário não encontrado" }
  }

  // Verificação de senha - compara com password_hash
  if (admin.password_hash !== password) {
    console.log("[v0] Password mismatch")
    return { error: "Senha incorreta" }
  }

  console.log("[v0] Login successful for:", email)

  // Criar sessão
  const cookieStore = await cookies()
  const sessionData = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  }

  cookieStore.set("admin_session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: "/",
  })

  return { success: true }
}

export async function signUp(email: string, password: string, name: string) {
  const supabase = await createServerClient()

  // Verificar se já existe
  const { data: existing } = await supabase.from("admins").select("email").eq("email", email).single()

  if (existing) {
    return { error: "Email já cadastrado" }
  }

  // Criar novo admin (senha será armazenada como texto simples por enquanto)
  // Em produção, use bcrypt para hash
  const { error } = await supabase.from("admins").insert({
    email,
    password_hash: password, // Armazenar como texto simples por enquanto
    name,
  })

  if (error) {
    return { error: "Erro ao criar conta" }
  }

  return { success: true }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/login")
}
