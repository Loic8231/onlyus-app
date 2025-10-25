// scripts/setPassword.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "❌ Il manque des variables d'environnement. Assure-toi que VITE_SUPABASE_URL et VITE_SUPABASE_SERVICE_ROLE_KEY sont définies."
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

type UpdateResult = {
  data: any;
  error: any;
};

async function updateUser(userId: string, password: string) {
  try {
    console.log(`→ Mise à jour de l'utilisateur ${userId} ...`);
    // On tente de changer le mot de passe ET de marquer l'email comme confirmé
    const res: UpdateResult = await (admin as any).auth.admin.updateUserById(userId, {
      password,
      // la clé peut varier selon la version du SDK ; on tente d'indiquer qu'on veut confirmer l'email
      email_confirm: true,
    });

    if (res?.error) {
      console.error(`❌ Erreur API pour ${userId} :`, res.error);
      return false;
    }

    console.log(`✅ updateUserById OK pour ${userId}.`);
    // Affiche quelques infos utiles (sans exposer d'infos sensibles)
    console.log("   -> retour:", {
      id: res?.data?.id,
      email: res?.data?.email,
      email_confirmed_at: res?.data?.email_confirmed_at ?? null,
    });
    return true;
  } catch (e: any) {
    console.error(`❌ Exception lors de updateUserById pour ${userId}:`, e.message || e);
    return false;
  }
}

async function run() {
  // Liste des utilisateurs à modifier (ids)
  const targets: { id: string; label?: string }[] = [
    { id: "80240baa-7d3e-4fc7-ab0a-641e01bf3d20", label: "Loïc" },
    { id: "2256ece0-490b-4bee-a00b-f82f62b2f7be", label: "Asis" },
  ];

  const newPassword = "onlyus123";

  let anyFail = false;
  for (const t of targets) {
    const ok = await updateUser(t.id, newPassword);
    if (!ok) anyFail = true;
  }

  if (anyFail) {
    console.error("❌ Au moins une mise à jour a échoué. Vérifie la Service Role Key et que tu es sur le bon projet Supabase.");
    process.exit(2);
  }

  console.log("🎉 Tous les mots de passe ont été modifiés (et tentative de confirmation d'e-mail).");
  console.log("→ Maintenant :");
  console.log("   - Vérifie dans le Dashboard (Auth → Users) la colonne `email_confirmed_at` pour chaque utilisateur.");
  console.log("   - Ensuite, fais un `supabase.auth.signOut()` dans ton navigateur, vide le localStorage puis reconnecte-toi avec le nouveau mot de passe.");
  process.exit(0);
}

run().catch((e) => {
  console.error("Erreur inattendue :", e);
  process.exit(99);
});

