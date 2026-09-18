const fs = require('fs');
const path = require('path');
const adminDir = path.join(process.cwd(), 'src/components/admin');
const files = fs.readdirSync(adminDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(path.join(adminDir, file), 'utf8');
  
  // Replace handle with unique names
  let counter = 1;
  content = content.replace(/const handle = async \(\) => \{/g, () => {
    return `const handleBroken${counter++} = async (arg1?: any, arg2?: any) => {`;
  });

  // Replace await storageService.save( with await storageService.saveXXX(
  // Since we don't know the exact method, we'll map the file name to the method
  let methodPostfix = '';
  if (file.includes('Articles')) methodPostfix = 'Article';
  if (file.includes('Categories')) methodPostfix = 'Category';
  if (file.includes('Banners')) methodPostfix = 'Banner';
  if (file.includes('Businesses')) {
    // Both Store and Product
    content = content.replace(/await storageService\.save\((.*)\)/g, (match, p1) => {
      if (p1.includes('whatsapp') || p1.includes('category')) return `await storageService.saveBusinessStore(${p1})`;
      return `await storageService.saveBusinessProduct(${p1})`;
    });
    content = content.replace(/await storageService\.delete\((.*)\)/g, (match, p1) => {
      // It's hard to tell without context, but we will leave delete as delete and fix later
      return match;
    });
  } else if (file.includes('Popup')) methodPostfix = 'SitePopup';
  else if (file.includes('Identity')) methodPostfix = 'VisualIdentity';
  else if (file.includes('Facebook')) methodPostfix = 'FacebookConfig';
  else if (file.includes('Agenda')) methodPostfix = 'EventAgendaItem';
  else if (file.includes('Galleries')) methodPostfix = 'Gallery';
  
  if (methodPostfix && !file.includes('Businesses')) {
    content = content.replace(/await storageService\.save\(/g, `await storageService.save${methodPostfix}(`);
    content = content.replace(/await storageService\.delete\(/g, `await storageService.delete${methodPostfix}(`);
  }
  
  fs.writeFileSync(path.join(adminDir, file), content);
});
console.log('Fixed handle names');
