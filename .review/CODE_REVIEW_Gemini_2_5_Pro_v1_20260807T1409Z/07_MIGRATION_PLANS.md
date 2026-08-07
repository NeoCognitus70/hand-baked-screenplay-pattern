# Section 7: Migration Plans

[<- Back to Index](00_CODE_REVIEW_Gemini_2_5_Pro_v1_20260807T1409Z.md)

## Migration Strategies

### Single Source of Truth for Features
- Feature specifications in sibling projects (`calculator-screenplay-bdd`) utilize this library as an underlying Screenplay engine while maintaining standalone feature files.

### Docker Compose for Local Development
- N/A - Project is a zero-dependency TypeScript library running on native Node.js 20+; containerization is not required for local development or testing.

### GitHub Actions/Workflow
- **CI Pipeline (`ci.yml`):** Runs `npm run verify` across Node 20, 22, and 24.
- **Pages Pipeline (`pages.yml`):** Builds and publishes the deterministic static sample report to GitHub Pages on push to `main` with deploy-only permissions (`pages: write`, `id-token: write`).

---

[<- Back to Index](00_CODE_REVIEW_Gemini_2_5_Pro_v1_20260807T1409Z.md)
