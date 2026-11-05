const SUPABASE_URL = 'https://uumiiojxbbbqazqrcmvr.supabase.co';
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bWlpb2p4YmJicWF6cXJjbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2Mzk2OTEsImV4cCI6MjEwNzIxNTY5MX0.Pr-p7UahuB6Sn2ev08p92Xj9chgYFwneUpDzxoTBMmk";

// Inicialización compatible con navegador
let supabaseClient = null;

if (window.supabase && typeof window.supabase.createClient === "function") {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error("No se pudo cargar la librería Supabase desde el CDN.");
}

// Mantenemos la variable global 'supabase'
var supabase = supabaseClient;