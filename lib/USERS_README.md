# Adding New Users

To add a new user account manually, follow these steps:

1. Open `lib/users.ts`
2. Generate a password hash using Node.js:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123', 10).then(hash => console.log(hash));"
   ```
3. Add the new user to the `users` array:
   ```typescript
   {
     username: "NewUsername",
     password: "paste-the-hashed-password-here",
   },
   ```

## Current Users

- **Username:** Moudh
- **Password:** Apartments123

