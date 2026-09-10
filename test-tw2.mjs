import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import fs from 'fs';

const css1 = `
@import "tailwindcss";
@theme {
  --color-sand-50: #FBF8F2;
  @keyframes wave-drift { 0% {} }
}
.test-1 { @apply text-sand-50; }
`;

const css2 = `
@import "tailwindcss";
@theme {
  --color-sand-50: #FBF8F2;
}
@keyframes wave-drift { 0% {} }
.test-2 { @apply text-sand-50; }
`;

async function test() {
  try {
    const r1 = await postcss([tailwindcss()]).process(css1, { from: 'in.css' });
    console.log("CSS1 success:", r1.css.includes('color: var(--color-sand-50)'));
  } catch(e) { console.log("CSS1 error:", e.message); }

  try {
    const r2 = await postcss([tailwindcss()]).process(css2, { from: 'in.css' });
    console.log("CSS2 success:", r2.css.includes('color: var(--color-sand-50)'));
  } catch(e) { console.log("CSS2 error:", e.message); }
}

test();
