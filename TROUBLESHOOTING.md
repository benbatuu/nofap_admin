# Troubleshooting Guide

This guide helps you resolve common issues with the application.

## Hydration Errors

### Problem: "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties"

**Causes:**

- Server-side and client-side rendering mismatch
- Dynamic data loading without proper hydration handling
- Date/time formatting differences between server and client

**Solutions:**

1. **Use ClientOnly wrapper** for dynamic content:

   ```tsx
   import { ClientOnly } from "@/components/client-only";

   <ClientOnly fallback={<LoadingSkeleton />}>
     <DynamicContent />
   </ClientOnly>;
   ```

2. **Add proper loading states** during hydration:

   ```tsx
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
     setMounted(true);
   }, []);

   if (!mounted) {
     return <LoadingSkeleton />;
   }
   ```

3. **Use initialData in React Query** to prevent hydration mismatches:
   ```tsx
   useQuery({
     queryKey: ["data"],
     queryFn: fetchData,
     initialData: [], // Prevents undefined/null mismatches
   });
   ```

## Database Issues

### Problem: Connection errors or "Database not found"

**Solutions:**

1. **Check your DATABASE_URL** in `.env`:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```

2. **Test database connection**:

   ```bash
   npm run db:test
   ```

3. **Reset and setup database**:
   ```bash
   npm run db:setup
   ```

### Problem: Prisma client not generated

**Solutions:**

1. **Generate Prisma client**:

   ```bash
   npm run db:generate
   ```

2. **Check Prisma schema** for syntax errors in `prisma/schema.prisma`

3. **Clear node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run db:generate
   ```

## API Issues

### Problem: API endpoints returning 500 errors

**Solutions:**

1. **Test API endpoints**:

   ```bash
   npm run api:test
   ```

2. **Check server logs** in the terminal running `npm run dev`

3. **Verify database connection** and ensure seed data exists:
   ```bash
   npm run db:test
   npm run db:seed
   ```

### Problem: Empty data or undefined responses

**Solutions:**

1. **Check API response structure** in browser dev tools Network tab

2. **Verify service layer** is properly connected to database

3. **Add defensive programming**:
   ```tsx
   const data = Array.isArray(apiData) ? apiData : [];
   const safeValue = item?.property || "default";
   ```

## React Query Issues

### Problem: Data not updating after mutations

**Solutions:**

1. **Invalidate queries** after mutations:

   ```tsx
   const mutation = useMutation({
     mutationFn: updateData,
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["data"] });
     },
   });
   ```

2. **Check query keys** are consistent between queries and invalidations

3. **Use optimistic updates** for better UX:
   ```tsx
   onMutate: async (newData) => {
     await queryClient.cancelQueries({ queryKey: ["data"] });
     const previousData = queryClient.getQueryData(["data"]);
     queryClient.setQueryData(["data"], newData);
     return { previousData };
   };
   ```

## Performance Issues

### Problem: Slow page loads or API responses

**Solutions:**

1. **Add pagination** to large datasets:

   ```tsx
   const { data } = useQuery({
     queryKey: ["data", page, limit],
     queryFn: () => fetchData({ page, limit }),
   });
   ```

2. **Implement proper caching**:

   ```tsx
   useQuery({
     queryKey: ["data"],
     queryFn: fetchData,
     staleTime: 30000, // 30 seconds
     cacheTime: 300000, // 5 minutes
   });
   ```

3. **Use React.memo** for expensive components:
   ```tsx
   const ExpensiveComponent = React.memo(({ data }) => {
     // Component logic
   });
   ```

## TypeScript Issues

### Problem: Type errors with Prisma generated types

**Solutions:**

1. **Regenerate Prisma client**:

   ```bash
   npm run db:generate
   ```

2. **Check import paths** for generated types:

   ```tsx
   import { User } from "@/lib/generated/prisma";
   ```

3. **Use proper type assertions** when needed:
   ```tsx
   const user = data as User;
   ```

## Development Workflow

### Problem: Changes not reflecting in browser

**Solutions:**

1. **Hard refresh** browser (Ctrl+Shift+R or Cmd+Shift+R)

2. **Clear Next.js cache**:

   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check file watchers** are working (especially in Docker/WSL)

4. **Restart development server**:
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev
   ```

## Common Error Messages

### "Module not found: Can't resolve '@/lib/services'"

**Solution:** Check that the import path is correct and the file exists:

```tsx
import { UserService } from "@/lib/services";
// or
import { UserService } from "@/lib/services/user.service";
```

### "Cannot read property 'map' of undefined"

**Solution:** Add defensive programming:

```tsx
{
  Array.isArray(data) &&
    data.map((item) => <div key={item.id}>{item.name}</div>);
}
```

### "Hydration failed because the initial UI does not match"

**Solution:** Use ClientOnly wrapper or proper loading states as described above.

## Getting Help

1. **Check browser console** for detailed error messages
2. **Check server logs** in terminal
3. **Use React Developer Tools** to inspect component state
4. **Use Network tab** to inspect API requests/responses
5. **Check database directly** using a PostgreSQL client

## Useful Commands

```bash
# Database
npm run db:setup          # Complete database setup
npm run db:test           # Test database connection
npm run db:seed           # Seed with sample data
npm run db:generate       # Generate Prisma client

# API
npm run api:test          # Test API endpoints

# Development
npm run dev               # Start development server
npm run build             # Build for production
npm run lint              # Run linting

# Debugging
npx prisma studio         # Open Prisma Studio (database GUI)
npx prisma db push --force-reset  # Reset database completely
```

Remember: Most issues can be resolved by ensuring the database is properly set up and the Prisma client is generated correctly.
