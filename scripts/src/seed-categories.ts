import { db, categoriesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const CATEGORIES = [
  "Analgesics & Pain Relief",
  "Antibiotics & Antimicrobials",
  "Antivirals",
  "Antifungals",
  "Antiparasitics",
  "Cardiovascular Drugs",
  "Antidiabetics",
  "Respiratory & Pulmonary",
  "Gastrointestinal",
  "Dermatologicals",
  "Vitamins, Minerals & Supplements",
  "Hormones & Endocrinology",
  "Oncology",
  "Immunosuppressants",
  "Neurology & CNS",
  "Psychiatry & Mental Health",
  "Ophthalmology",
  "ENT (Ear, Nose & Throat)",
  "Urology & Nephrology",
  "Obstetrics & Gynaecology",
  "Musculoskeletal",
  "Vaccines & Biologicals",
  "Surgical & Hospital Supplies",
  "Diagnostic & Lab Supplies",
  "Medical Devices & Equipment",
  "Disinfectants & Antiseptics",
  "Dental & Oral Care",
  "Nutrition & Enteral Feeding",
  "Herbal & Traditional Medicine",
  "Other / Unclassified",
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log(`Seeding ${CATEGORIES.length} medical categories…`);
  let inserted = 0;
  let skipped = 0;
  for (const name of CATEGORIES) {
    const slug = slugify(name);
    const result = await db
      .insert(categoriesTable)
      .values({ name, slug, description: null, imageUrl: null })
      .onConflictDoNothing({ target: categoriesTable.slug })
      .returning({ id: categoriesTable.id });
    if (result.length > 0) {
      inserted++;
      console.log(`  + ${name}  →  /${slug}`);
    } else {
      skipped++;
    }
  }
  console.log(`\nDone. Inserted: ${inserted}, already-existing: ${skipped}`);
  const total = await db.select({ c: sql<number>`count(*)::int` }).from(categoriesTable);
  console.log(`Total categories in DB now: ${total[0].c}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
