import fs from "node:fs";
import path from "node:path";

export default async function globalSetup() {
  const file = path.join(process.cwd(),"data","e2e.db");
  for (const suffix of ["","-shm","-wal"]) fs.rmSync(`${file}${suffix}`, { force: true });
}
