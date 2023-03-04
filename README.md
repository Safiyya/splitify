This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## WIREFRAMES

https://whimsical.com/splitify-7x6QM5DhyRhcnP6DKrEqA6

## TECHNICAL

- use React.Context to store context after load
- Check that refresh token works
- use rem instead of px

## TODO

- [x] Connect to spotify
- [x] (DEPLOY)
- [x] User load all their songs saved songs at the time (pagination)
- [x] Based on songs, create split by genres
  - Splitting by related artists only without k-mean depends on list order => NOT GOOD
  - Splitting by related artists using a k-mean =>
  - Splitting by artist's top track metadata + release year => GOOD but need to improve distance function
  - Splitting by genres => some stragglers but good start
- [ ] For each relevant* (genre? cluster?) split, *stage a playlist\*
- [ ] (MILESTONE 1) On button click, show preview of playlist assignment
- [ ] Highlight stragglers
- [ ] (DEPLOY)
- [ ] (MILESTONE 4) : Login page
- [ ] (MILESTONE 5) : UI and styling

## SHOULD

- [ ] easily tagged playlist and retrievable by API to not confuse with other playlist e.g. followed by Splitify
