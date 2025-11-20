# Curie - Claim Your Profile POC

A proof-of-concept application demonstrating the "claim your profile" flow using the NPI registry, lightweight verification, and identity-based account creation.

## Features

- **Profile Lookup**: Search by name or NPI number
- **Identity Verification**: Lightweight KBA (Knowledge-Based Authentication) questions
- **Account Creation**: Verified and manual account creation flows
- **Data Persistence**: JSON-based storage for account data

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- NPI Registry API integration

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/lib` - Utility functions (NPI lookup, KBA generation, storage)
- `/types` - TypeScript type definitions
- `/data` - JSON file storage (created at runtime)

## Flow

1. `/claim` - Landing page
2. `/lookup` - Search for profile by name or NPI
3. `/select` - Select your profile from matches
4. `/verify` - Answer KBA questions
5. `/create-account` - Create verified account
6. `/success` - Confirmation screen

Fallback flow:
- `/manual` - Manual account creation (unverified)

## API Routes

- `GET /api/npi-lookup` - Search NPI registry
- `GET /api/verify` - Get KBA questions
- `POST /api/verify` - Verify KBA answers
- `POST /api/create-account` - Create verified account
- `POST /api/manual-create` - Create manual account

## Notes

- This is a proof-of-concept, not production-grade code
- Data is stored in `/data/claimed.json` (created at runtime)
- KBA questions are auto-generated from NPI record data
- Verification requires at least 1 correct answer out of 2 questions

