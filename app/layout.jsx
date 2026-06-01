import '@/src/styles/index.css';
import '@/src/styles/components.css';
import '@/src/styles/app.css';

export const metadata = {
  title: 'ViralCut AI — Turn Long Videos into Viral Shorts Instantly',
  description:
    "The world's first semantically-aware short-form video editor. AI finds hooks, injects B-roll, adds captions — publish-ready Reels, Shorts & TikToks in minutes.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fragment+Mono&family=Inter:wght@400;500;600;700;900&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v7.2.0/css/all.css" />
        <link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v7.2.0/css/duotone.css" />
        <link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v7.2.0/css/duotone-regular.css" />
        <link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v7.2.0/css/duotone-light.css" />
        <link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v7.2.0/css/duotone-thin.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
