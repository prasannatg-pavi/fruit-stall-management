import { createClient } from "@supabase/supabase-js"

const supabaseUrl = 'https://tvllicmyzhgdteboasho.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2bGxpY215emhnZHRlYm9hc2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTQzMzQsImV4cCI6MjA2NzU3MDMzNH0.zHzhbaSqTGJg_9q3qoAnbFEQ1aP21YM2OxyfCI-A9t4'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
