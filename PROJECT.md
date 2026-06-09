# Commands

---

***ESLint auto-fix***

```
npm run lint
```

This will auto fix things instead of only showing them.

---

***ESLint restarting server***

```
Ctrl + Shift + P
```

```
ESLint: Restart ESLint Server
```

Recommended after changing ESLint configs.

---

***Prisma schema change flow***

After changing `prisma/schema.prisma`, create/apply a migration and regenerate the Prisma client:

```
npx prisma migrate dev --name describe_change_here
```

If you only need to regenerate the client:

```
npx prisma generate
```

Open the database browser:

```
npx prisma studio
```




