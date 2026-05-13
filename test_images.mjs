import fetch from 'node-fetch';

const urls = [
  "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80",
  "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80",
  "https://cellphones.com.vn/sforum/wp-content/uploads/2023/08/cach-lam-ga-nuong-mat-ong.jpg",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80",
  "https://images.unsplash.com/photo-1517093157656-b9ecce89e6a4?w=800&q=80",
  "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&q=80"
];

async function test() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`URL: ${url} -> STATUS: ${res.status}`);
    } catch (e) {
      console.log(`URL: ${url} -> ERROR: ${e.message}`);
    }
  }
}
test();
