const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing. Set it in .env (e.g. http://localhost:5000)."
    );
  }

export async function getHealth() {
  const res = await fetch(`${API_URL}/api/Health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Health failed: ${res.status}`);
  return res.json() as Promise<{ status: string; message?: string }>;
}