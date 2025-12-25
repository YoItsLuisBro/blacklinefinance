import { supabase } from "./supabaseClient";

const DEFAULT_CATEGORIES = [
  { name: "Income", kind: "income" },
  { name: "Rent", kind: "expense" },
  { name: "Utilities", kind: "expense" },
  { name: "Groceries", kind: "expense" },
  { name: "Dining", kind: "expense" },
  { name: "Gas", kind: "expense" },
  { name: "Transport", kind: "expense" },
  { name: "Shopping", kind: "expense" },
  { name: "Health", kind: "expense" },
  { name: "Subscriptions", kind: "expense" },
  { name: "Savings", kind: "expense" },
  { name: "Other", kind: "expense" },
];

export async function ensureDefaultCategories(userId) {
  // If user already has categories, do nothing
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (error) throw error;
  if (data && data.length > 0) return;

  const rows = DEFAULT_CATEGORIES.map((c) => ({
    user_id: userId,
    name: c.name,
    kind: c.kind,
  }));

  const { error: insertError } = await supabase.from("categories").insert(rows);
  if (insertError) throw insertError;
}
