const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');
content = content.replace(/AnomalyAlert\s+AnomalyAlert\[\]/, 'AnomalyAlert AnomalyAlert[] @relation("AnomalyReviewer")');
fs.writeFileSync('prisma/schema.prisma', content, 'utf8');
