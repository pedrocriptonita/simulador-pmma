import { PrismaClient, Role, SubjectCategory } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

// O Prisma CLI carrega apenas o .env; as chaves do Supabase estão no .env.local
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local ausente: segue apenas com o que já está no ambiente
}

const prisma = new PrismaClient();

const PLANS = [
  {
    slug: "free",
    name: "Gratuito",
    description: "1 simulado por semana para conhecer a plataforma.",
    priceCents: 0,
    isActive: true,
  },
  {
    slug: "ate-a-prova",
    name: "Acesso até a Prova",
    description:
      "Simulados ilimitados, todos os PDFs e dashboard completo até a prova de 11/10/2026.",
    priceCents: 3990,
    isActive: true,
  },
];

// Pesos = quantidade de itens por bloco no edital (CG: 50, CE: 70)
const SUBJECTS = [
  {
    slug: "lingua-portuguesa",
    name: "Língua Portuguesa",
    category: SubjectCategory.CONHECIMENTOS_GERAIS,
    weight: 15,
    order: 1,
  },
  {
    slug: "historia-do-brasil",
    name: "História do Brasil",
    category: SubjectCategory.CONHECIMENTOS_GERAIS,
    weight: 5,
    order: 2,
  },
  {
    slug: "historia-do-maranhao",
    name: "História do Maranhão",
    category: SubjectCategory.CONHECIMENTOS_GERAIS,
    weight: 5,
    order: 3,
  },
  {
    slug: "geografia-do-brasil",
    name: "Geografia do Brasil",
    category: SubjectCategory.CONHECIMENTOS_GERAIS,
    weight: 5,
    order: 4,
  },
  {
    slug: "geografia-do-maranhao",
    name: "Geografia do Maranhão",
    category: SubjectCategory.CONHECIMENTOS_GERAIS,
    weight: 5,
    order: 5,
  },
  {
    slug: "nocoes-de-informatica",
    name: "Noções de Informática",
    category: SubjectCategory.CONHECIMENTOS_GERAIS,
    weight: 7,
    order: 6,
  },
  {
    slug: "raciocinio-logico",
    name: "Raciocínio Lógico",
    category: SubjectCategory.CONHECIMENTOS_GERAIS,
    weight: 8,
    order: 7,
  },
  {
    slug: "legislacao-institucional",
    name: "Legislação Institucional",
    category: SubjectCategory.CONHECIMENTOS_ESPECIFICOS,
    weight: 70,
    order: 8,
  },
];

async function seedAdmin(freePlanId: string) {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!email || !password || !supabaseUrl || !serviceRoleKey) {
    console.warn(
      "⚠ Admin não criado: defina SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD e as chaves do Supabase no .env.local",
    );
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Cria no Supabase Auth (ou reaproveita se já existir)
  let authUserId: string | undefined;
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Admin" },
  });

  if (created?.user) {
    authUserId = created.user.id;
  } else if (error) {
    const { data: list, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) throw listError;
    authUserId = list.users.find((u) => u.email === email)?.id;
    if (!authUserId) throw error;
  }

  await prisma.user.upsert({
    where: { id: authUserId! },
    update: { role: Role.ADMIN },
    create: {
      id: authUserId!,
      email,
      name: "Admin",
      role: Role.ADMIN,
      planId: freePlanId,
    },
  });

  console.log(`✔ Admin pronto: ${email}`);
}

async function main() {
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        description: plan.description,
        priceCents: plan.priceCents,
        isActive: plan.isActive,
      },
      create: plan,
    });
  }
  console.log(`✔ ${PLANS.length} planos`);

  for (const subject of SUBJECTS) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: {
        name: subject.name,
        category: subject.category,
        weight: subject.weight,
        order: subject.order,
      },
      create: subject,
    });
  }
  console.log(`✔ ${SUBJECTS.length} matérias do edital`);

  const freePlan = await prisma.plan.findUniqueOrThrow({ where: { slug: "free" } });
  await seedAdmin(freePlan.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
