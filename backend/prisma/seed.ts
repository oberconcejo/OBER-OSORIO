import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el seeder con bcrypt...');

  // Crear Organización Base
  const org = await prisma.organization.upsert({
    where: { id: 'org_default' },
    update: {},
    create: {
      id: 'org_default',
      name: 'Organización Electoral Principal',
    },
  });

  console.log(`Organización Creada: ${org.name}`);

  // Base Geográfica por defecto
  let depto = await prisma.department.findFirst({ where: { organization_id: org.id } });
  if (!depto) depto = await prisma.department.create({ data: { organization_id: org.id, name: 'Cundinamarca' } });
  
  let muni = await prisma.municipality.findFirst({ where: { department_id: depto.id } });
  if (!muni) muni = await prisma.municipality.create({ data: { department_id: depto.id, name: 'Bogotá D.C.' } });
  
  let zone = await prisma.zone.findFirst({ where: { municipality_id: muni.id } });
  if (!zone) zone = await prisma.zone.create({ data: { municipality_id: muni.id, name: 'Zona Centro' } });
  
  console.log(`Geografía Base Creada - Zona ID: ${zone.id}`);

  // Generar hash real para la contraseña "admin123"
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Crear Usuario Base (Admin)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@electoral360.com' },
    update: {
      password_hash: passwordHash, // Actualiza el hash si ya existe
    },
    create: {
      organization_id: org.id,
      email: 'admin@electoral360.com',
      password_hash: passwordHash,
      name: 'Admin Principal',
      status: 'ACTIVE',
    },
  });

  console.log(`Usuario Admin Creado: ${admin.email}`);
  console.log('Contraseña de acceso: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
