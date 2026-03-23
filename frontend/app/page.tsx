import { supabase } from "@/lib/supabase"

export default async function Home() {
  const { data, error } = await supabase
    .from('events')
    .select('*')

  return (
    <main className="flex h-screen items-center justify-center flex-col gap-4">
      <h1 className="text-2xl font-bold">Memento Live 🚀</h1>
      <p>{error ? "Error connecting ❌" : "Supabase connected ✅"}</p>
    </main>
  )
}