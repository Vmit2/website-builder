# Contributing Guide

Thank you for your interest in contributing to Portfolio Builder! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Focus on the code, not the person
- Help others learn and grow
- Report issues constructively

## Getting Started

### 1. Fork & Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/website-builder.git
cd website-builder

# Add upstream remote
git remote add upstream https://github.com/Vmit2/website-builder.git
```

### 2. Create Feature Branch

```bash
# Update main branch
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 3. Setup Development Environment

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Add your credentials to .env.local
```

### 4. Start Development

```bash
# Start dev server
npm run dev

# In another terminal, run tests
npm run test:watch
```

## Development Workflow

### Code Style

We use ESLint and Prettier for code formatting. Run before committing:

```bash
npm run lint
npm run format
```

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build, dependencies, tooling

**Examples**:
```
feat(auth): add email verification
fix(dashboard): resolve analytics loading issue
docs: update API documentation
test(signup): add validation tests
```

### Testing

Write tests for new features:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- path/to/test.ts

# Check coverage
npm run test -- --coverage
```

**Test Structure**:
```typescript
describe('Feature Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Pull Request Process

1. **Update your branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**:
   - Go to GitHub and create PR
   - Use clear title and description
   - Link related issues
   - Add screenshots for UI changes

4. **PR Description Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Related Issues
   Fixes #123

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   How to test these changes

   ## Checklist
   - [ ] Tests pass locally
   - [ ] Code follows style guidelines
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

5. **Address Review Comments**:
   - Make requested changes
   - Push new commits
   - Re-request review

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # User dashboard
│   ├── admin/             # Admin pages
│   ├── api/               # API routes
│   └── [subdomain]/       # Dynamic routes
├── components/            # React components
│   ├── themes/           # Theme components
│   ├── admin/            # Admin components
│   └── ui/               # Shared UI
├── lib/                   # Utilities
│   ├── db.ts             # Database client
│   └── utils.ts          # Helper functions
├── __tests__/            # Tests
└── middleware.ts         # Middleware
```

## Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Subdomain routing |
| `lib/db.ts` | Supabase client |
| `lib/utils.ts` | Utilities |
| `app/api/` | API routes |
| `components/` | React components |

## Common Tasks

### Add a New API Endpoint

1. Create file: `app/api/[feature]/[action]/route.ts`
2. Implement GET/POST/PUT/DELETE handlers
3. Add error handling and validation
4. Write tests in `__tests__/api/`
5. Document in `docs/API.md`

**Example**:
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Add a New Component

1. Create file: `components/[category]/ComponentName.tsx`
2. Use TypeScript for type safety
3. Add PropTypes or interfaces
4. Write tests in `__tests__/components/`
5. Export from `components/index.ts`

**Example**:
```typescript
// components/admin/NewComponent.tsx
'use client';

import { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export default function NewComponent({ title, children }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
```

### Update Database Schema

1. Create migration in Supabase dashboard
2. Test locally with Supabase
3. Update `docs/schema.sql`
4. Document changes in PR

### Add a New Theme

1. Create component: `components/themes/ThemeName/index.tsx`
2. Add theme metadata to database
3. Add preview images to Cloudinary
4. Test with theme selector
5. Document in `docs/THEMES.md`

## Debugging

### Enable Debug Logging

```typescript
// In your code
console.log('[DEBUG]', variableName);

// In browser console
localStorage.debug = '*';
```

### Use VS Code Debugger

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Database Debugging

```typescript
// Enable Supabase logging
const supabase = createClient(url, key, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

// Check queries
supabase
  .from('sites')
  .select('*')
  .then(({ data, error }) => {
    console.log('[DB]', { data, error });
  });
```

## Performance Tips

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="url"
  alt="description"
  width={800}
  height={600}
  quality={80}
  priority={false}
/>
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  { loading: () => <p>Loading...</p> }
);
```

### Memoization

```typescript
import { memo, useMemo } from 'react';

const MemoComponent = memo(function Component({ prop }) {
  const expensive = useMemo(() => {
    return complexCalculation(prop);
  }, [prop]);

  return <div>{expensive}</div>;
});
```

## Security Guidelines

### Never Commit Secrets

```bash
# Add to .gitignore
.env.local
.env.*.local
*.pem
```

### Validate User Input

```typescript
// Always validate and sanitize
const email = request.body.email?.toLowerCase().trim();
if (!isValidEmail(email)) {
  return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
}
```

### Use Environment Variables

```typescript
// Good
const apiKey = process.env.RAZORPAY_KEY_SECRET;

// Bad
const apiKey = 'sk_live_xxxxx';
```

### Check Authentication

```typescript
// Always verify user is authenticated
const userId = request.headers.get('x-user-id');
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Documentation

### Update Docs When

- Adding new features
- Changing API endpoints
- Modifying database schema
- Updating configuration

### Documentation Files

- `README.md` - Project overview
- `docs/API.md` - API reference
- `docs/ARCHITECTURE.md` - System design
- `docs/SETUP.md` - Setup instructions
- `docs/DEPLOYMENT.md` - Deployment guide

## Getting Help

- **GitHub Issues**: Ask questions or report bugs
- **Discussions**: General questions and ideas
- **Email**: support@brand.com
- **Documentation**: Check `/docs` folder first

## Review Process

1. **Automated Checks**:
   - Linting and formatting
   - Type checking
   - Tests

2. **Code Review**:
   - One approval required
   - Maintainers review for quality
   - Feedback within 48 hours

3. **Merge**:
   - Squash commits
   - Add to changelog
   - Deploy to staging

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Push to main branch
5. GitHub Actions deploys to production

## Recognition

Contributors will be:
- Added to `CONTRIBUTORS.md`
- Mentioned in release notes
- Credited in documentation

## Questions?

- Check existing issues
- Read documentation
- Ask in discussions
- Email support@brand.com

---

Thank you for contributing! 🎉
