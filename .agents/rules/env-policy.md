# Environment Files Policy (.env)

- **NEVER read or view `.env` files**: Do not inspect, read, or output the contents of `.env`, `.env.local`, `.env.production`, or any sensitive environment files.
- **NEVER write or modify `.env` files**: Do not create, edit, or overwrite `.env`, `.env.local`, `.env.production`, or other private environment files.
- **Reference `.env.example` only**: Always use `.env.example` as the single reference for environment variable names, schemas, documentation, and placeholder values.
- **Instruct the user**: If new environment variables are needed, update `.env.example` and inform the user to update their `.env` file manually.
