const fs = require('fs');
const path = 'c:/Users/91998/OneDrive/Desktop/AppZeto/Saathi-Grow/Frontend/src/modules/vendor/pages/Orders/OrderDetail.jsx';
let content = fs.readFileSync(path, 'utf8');

const search = "{item.product?.name || 'Unknown Product'}";
const replace = "{item.product?.name || item.name || 'Unknown Product'}</p>\n                                        {item.physicalLocation && <p className=\"text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-0.5\"><MapPin size={10} className=\"text-amber-500\" />{item.physicalLocation}</p>}";

content = content.replace(search + '</p>', replace);
fs.writeFileSync(path, content, 'utf8');
console.log('Update complete');
