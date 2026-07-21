import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const owner = process.env.APP_OWNER_EMAIL?.trim().toLowerCase();
if (!url || !key || !owner) {
  throw new Error(
    "Configura NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY y APP_OWNER_EMAIL en .env.local.",
  );
}
if (!process.stdin.isTTY)
  throw new Error("Este comando requiere una terminal interactiva.");

const terminal = createInterface({
  input: process.stdin,
  output: process.stdout,
});
const email = (await terminal.question("Correo propietario: "))
  .trim()
  .toLowerCase();
terminal.close();
const password = await new Promise((resolve, reject) => {
  let value = "";
  process.stdout.write("Contraseña (no se almacena): ");
  process.stdin.setRawMode(true);
  process.stdin.setEncoding("utf8");
  process.stdin.resume();
  function onData(character) {
    if (character === "\u0003") {
      process.stdin.setRawMode(false);
      reject(new Error("Importación cancelada."));
    } else if (character === "\r" || character === "\n") {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      resolve(value);
    } else if (character === "\u007f" || character === "\b") {
      value = value.slice(0, -1);
    } else {
      value += character;
    }
  }
  process.stdin.on("data", onData);
});
if (email !== owner)
  throw new Error("El correo no coincide con APP_OWNER_EMAIL.");

const supabase = createClient(url, key);
const { error: authError } = await supabase.auth.signInWithPassword({
  email,
  password,
});
if (authError) throw new Error("No se pudo autenticar la cuenta propietaria.");
const { data, error } = await supabase.rpc("import_demo_data");
await supabase.auth.signOut();
if (error) throw new Error("No se pudieron importar los datos demo.");
process.stdout.write(
  data === 0
    ? "Los datos demo ya existían.\n"
    : `${data} prospectos demo importados.\n`,
);
