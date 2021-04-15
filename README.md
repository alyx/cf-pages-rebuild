# cf-pages-rebuild

A Cloudflare Worker to trigger a Cloudflare Pages rebuild as a webhook.

## Setup

Will need the following secrets added to the Cloudflare Worker:
- "USERNAME": Your GitHub username
- "PAT": A GitHub Personal Access Token (needs repo management permissions)
- "REPO": The repository to update
- "TOKEN": A secret token used to authenticate incoming requests.

## Usage

An incoming webhook needs to send the header `X-AW-Token` with the content being the value of your `TOKEN` secret. The content of the webhook does not matter.

Upon validation of this token, `cf-pages-rebuild` will create a new, empty commit as the newest commit of the `main` branch of your repo. The `main` branch is currently hardcoded.

This commit will trigger Cloudflare Pages to rebuild the production branch of your repo.
