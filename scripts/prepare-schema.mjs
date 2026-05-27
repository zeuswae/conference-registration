import fs from "fs";

const path = "prisma/schema.prisma";
let schema = fs.readFileSync(path, "utf8");
const url = process.env.DATABASE_URL ?? "";

if (url.startsWith("postgresql")) {
  schema = schema.replace(/provider = "sqlite"/, 'provider = "postgresql"');
  console.log("Prisma: using PostgreSQL (Neon)");
} else {
  schema = schema.replace(/provider = "postgresql"/, 'provider = "sqlite"');
  console.log("Prisma: using SQLite (local)");
}

fs.writeFileSync(path, schema);
