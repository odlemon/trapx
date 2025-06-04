# TrapX

🎯 Type-safe error handling for TypeScript backends

[![npm version](https://img.shields.io/npm/v/trapx.svg)](https://www.npmjs.com/package/trapx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## Features

- 🛡️ Type-safe error handling
- 🎨 Customizable error responses
- 🔄 Framework agnostic core
- 📦 Express.js integration (more coming soon!)
- 🎭 Development/Production modes
- 🎯 Stack trace control
- 🎪 Custom error transformation

## Installation

```bash
npm install trapx
# or
yarn add trapx
```

## Quick Start

```typescript
import express from 'express';
import { createExpressErrorHandler, NotFoundError } from 'trapx';

const app = express();

app.get('/users/:id', (req, res) => {
  throw new NotFoundError('User not found');
});

app.use(createExpressErrorHandler());
```

## Real-World Examples

### 1. API Input Validation

```typescript
import { ValidationError } from 'trapx';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
});

app.post('/users', (req, res) => {
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError('Invalid user data', {
      details: result.error.flatten()
    });
  }
  // Process valid user...
});
```

### 2. Authentication & Authorization

```typescript
import { UnauthorizedError, ForbiddenError } from 'trapx';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }
  
  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required', {
      details: {
        requiredRole: 'admin',
        userRole: req.user.role
      }
    });
  }
  next();
};

app.post('/admin/settings', authMiddleware, adminOnly, (req, res) => {
  // Update settings...
});
```

### 3. Database Operations with Error Handling

```typescript
import { NotFoundError, InternalServerError } from 'trapx';

class UserService {
  async getUserById(id: string) {
    try {
      const user = await db.users.findUnique({ where: { id } });
      
      if (!user) {
        throw new NotFoundError('User not found', {
          details: { userId: id }
        });
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      
      throw new InternalServerError('Database error', {
        details: { operation: 'getUserById' },
        cause: error
      });
    }
  }
}
```

### 4. Custom Error Transformation

```typescript
import { createExpressErrorHandler, BaseError } from 'trapx';

const errorHandler = createExpressErrorHandler({
  // Include stack traces in development
  includeStackTrace: process.env.NODE_ENV === 'development',
  
  // Custom error logging
  logError: (error) => {
    console.error('[App Error]:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  },
  
  // Transform unknown errors
  transformError: (error) => {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return new ValidationError('Resource already exists', {
        code: 'DUPLICATE_ENTRY',
        details: error.fields
      });
    }
    return new InternalServerError('Something went wrong');
  }
});
```

### 5. API Rate Limiting Example

```typescript
import { ValidationError } from 'trapx';
import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  handler: () => {
    throw new ValidationError('Too many requests', {
      code: 'RATE_LIMIT_EXCEEDED',
      details: {
        windowMs: '15m',
        maxRequests: 100,
        tryAgainIn: '15 minutes'
      }
    });
  }
});

app.use('/api', rateLimiter);
```

### 6. File Upload Validation

```typescript
import { ValidationError } from 'trapx';
import multer from 'multer';

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    throw new ValidationError('No file uploaded', {
      code: 'FILE_REQUIRED'
    });
  }

  if (!['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
    throw new ValidationError('Invalid file type', {
      code: 'INVALID_FILE_TYPE',
      details: {
        allowedTypes: ['image/jpeg', 'image/png'],
        receivedType: req.file.mimetype
      }
    });
  }

  // Process file...
});
```

## Advanced Configuration

### Custom Error Response Format

```typescript
import { createExpressErrorHandler, BaseError } from 'trapx';

interface CustomError extends BaseError {
  timestamp?: string;
  requestId?: string;
}

const errorHandler = createExpressErrorHandler({
  transformError: (error) => {
    const customError: CustomError = new BaseError(error.message);
    customError.timestamp = new Date().toISOString();
    customError.requestId = generateRequestId();
    return customError;
  }
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT 