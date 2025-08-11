import { createClient } from "@supabase/supabase-js"

// Default: Prasanna space
// const supabaseUrl = 'https://tvllicmyzhgdteboasho.supabase.co'
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2bGxpY215emhnZHRlYm9hc2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTQzMzQsImV4cCI6MjA2NzU3MDMzNH0.zHzhbaSqTGJg_9q3qoAnbFEQ1aP21YM2OxyfCI-A9t4'

// Pavithra
const supabaseUrl = 'https://eljhbevspjqxvmnrcvbj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsamhiZXZzcGpxeHZtbnJjdmJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NzYxMzAsImV4cCI6MjA3MDI1MjEzMH0.-uFuQOi9vXZfhAscbOUIYypqSHeRmPWuN5LatAtICAk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
