import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// flowType: 'implicit' est requis car les emails Supabase (confirmation,
// reset) utilisent le format #access_token=... dans le hash (implicit flow).
// supabase-js v2.26+ utilise PKCE par défaut (attend ?code=...) ce qui
// fait que le hash est ignoré → session jamais détectée → loading infini.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'implicit',
  },
})
