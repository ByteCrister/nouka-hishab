import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import fs from 'fs';

const css = `
@import "tailwindcss";
@theme {
  --color-sand-50: #FBF8F2;
  --color-river-500: #0B5D3B;
  --color-ink-900: #0A1712;
  --background-image-gloss-green: linear-gradient(155deg, #12784B 0%, #0B5D3B 45%, #084229 100%);
}
.test-colors {
  @apply text-sand-50 bg-ink-900 text-river-500 bg-gloss-green;
}
`;

postcss([tailwindcss()])
  .process(css, { from: 'src/app/globals.css' })
  .then(result => {
    fs.writeFileSync('out.css', result.css);
    console.log("Success! Wrote out.css");
  })
  .catch(err => {
    console.error("Error:", err);
  });
