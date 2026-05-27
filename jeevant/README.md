This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Local Admin Access

This app uses a single environment-driven admin password for login.

- Set the password in `.env.local` as `ADMIN_SECRET`.
- The login page compares the entered password against that value.
- If you change `ADMIN_SECRET`, restart the dev server so the new value is picked up.

## Admin Content Areas

- `/cms/schedule` is the day/week planner for time blocks, recurring work, and color-coded events.
- `/cms/journey` is where you add experience entries with start and end dates for the public timeline.
- `/cms/expertise` is where you add achievements, certifications, and proof links.
- `/cms/resume` edits the public resume identity fields such as title, resume link, and profile links.
- `/cms/projects` now supports optional project start and end dates plus an ongoing flag, so the public timeline and mini-Gantt can show real chronology.
- `/cms/schedule` also supports clearing events older than 30 days from the admin panel.

## Troubleshooting

- If `npm run dev` says it cannot find `package.json`, make sure you are inside the `jeevant` folder before running it.
- If Next.js/Turbopack complains about the workspace root, keep `turbopack.root` pointed at the `jeevant` directory in `next.config.ts`.
- If port `3000` is already in use, stop the existing dev server or run the app on another port with `npm run dev -- --port 3001`.
## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
