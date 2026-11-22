const good = '{"category":"delivery","urgency":"high"}';
const bad = '{category: delivery}';

console.log(JSON.parse(good));

try {
  console.log(JSON.parse(bad));
} catch (err) {
  console.log('Invalid JSON:', err.message);
}