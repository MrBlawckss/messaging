# Relay

A responsive, code-first messaging interface built as a static site for GitHub Pages.

## Preview locally

Open `index.html` directly, or run a local static server from this folder.

## Publish with GitHub Pages

1. Create a GitHub repository and add these files at its root.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`, then save.

## Demo behavior

- Profile, contacts, and sent messages persist in the browser using `localStorage`.
- Use contact code `hdw98Wfdha9AWH` to try adding a new contact.
- This static build is a working front-end prototype. Real cross-device accounts and global realtime messaging require an authentication and database service such as Firebase or Supabase.
