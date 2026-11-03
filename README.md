# Portfolio

Louie Apolinario's portfolio site. Product designer and computer engineer.

Built with React and Vite, plain CSS, deployed on Vercel.

## Develop

```bash
npm install
npm run dev      # local site at http://localhost:5173
npm run build    # production build
npm run lint
npm test         # contact form validation check
```

## Edit content

All text, projects and links live in [`src/content.js`](src/content.js).

## Contact form

`api/contact.js` runs as a Vercel function and sends messages through [Resend](https://resend.com).
Set the `RESEND_API_KEY` environment variable in the Vercel project for it to work.
