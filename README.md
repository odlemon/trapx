# TrapX

[![npm version](https://img.shields.io/npm/v/trapx.svg)](https://www.npmjs.com/package/trapx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A plug-and-play middleware for standardized error handling in TypeScript-based Express.js applications. TrapX simplifies error management, improves consistency across APIs, and enhances developer productivity by reducing boilerplate.

## 🌟 Features

- 🎯 **Standardized Error Handling**: Consistent error responses across your entire API
- 🔍 **Type-Safe**: Built with TypeScript for robust type checking and better IDE support
- 🛠️ **Customizable**: Flexible error transformation and handling options
- 🚦 **Environment-Aware**: Automatic stack trace handling based on environment
- 📦 **Pre-built Error Types**: Common HTTP error types included out of the box
- 🔄 **Extensible**: Easy to create custom error types for your specific needs
- 🪶 **Lightweight**: Zero external dependencies
- 📝 **Well Documented**: Comprehensive documentation and examples

## 📦 Installation

```bash
# Using npm
npm install trapx

# Using yarn
yarn add trapx

# Using pnpm
pnpm add trapx
```

## 🚀 Quick Start

```typescript
import express from 'express';
import { createErrorHandler, ValidationError } from 'trapx';

const app = express();

// Your routes and middleware
app.get('/example', (req, res) => {
  throw new ValidationError('Invalid input');
});

// Add the error handler as the last middleware
app.use(createErrorHandler());
```

## ⚙️ Configuration Options

The error handler can be customized with various options:

```typescript
interface ErrorHandlerOptions {
  // Include stack traces in error responses (defaults to true in development)
  includeStackTrace?: boolean;
  
  // Custom error logging function
  logError?: (error: Error) => void;
  
  // Transform errors before sending response
  transformError?: (error: Error) => Partial<BaseError>;
}

// Example usage with options
app.use(createErrorHandler({
  includeStackTrace: process.env.NODE_ENV !== 'production',
  logError: (error) => console.error('[TrapX]', error),
}));
```

## 📝 Built-in Error Types

TrapX comes with commonly used HTTP error types:

| Error Class | HTTP Status | Code |
|------------|-------------|------|
| ValidationError | 400 | VALIDATION_ERROR |
| UnauthorizedError | 401 | UNAUTHORIZED |
| ForbiddenError | 403 | FORBIDDEN |
| NotFoundError | 404 | NOT_FOUND |
| InternalServerError | 500 | INTERNAL_SERVER_ERROR |

## 🛠️ Creating Custom Errors

Extend the `BaseError` class to create your own error types:

```typescript
import { BaseError } from 'trapx';

class CustomError extends BaseError {
  constructor(message: string) {
    super(message, 422, {
      code: 'CUSTOM_ERROR',
      details: { custom: 'data' },
      isOperational: true
    });
  }
}
```

## 📤 Response Format

All errors are transformed into a consistent response format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {},
    "stack": "Error stack trace (development only)"
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Support

If you find this project helpful, please give it a ⭐️ on GitHub! 