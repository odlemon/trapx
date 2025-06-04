import express from 'express';
import { 
  createErrorHandler, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError 
} from '../src';

const app = express();

// Parse JSON bodies
app.use(express.json());

// Example route that throws a validation error
app.post('/users', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required', {
      details: {
        missing: !email ? 'email' : 'password'
      }
    });
  }

  // Your user creation logic here...
  res.status(201).json({ message: 'User created successfully' });
});

// Example route that throws an unauthorized error
app.get('/protected', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError('No authorization token provided');
  }

  // Your protected route logic here...
  res.json({ message: 'Protected data' });
});

// Example route that throws a not found error
app.get('/users/:id', (req, res) => {
  const user = null; // Simulating user not found

  if (!user) {
    throw new NotFoundError(`User with id ${req.params.id} not found`);
  }

  // Your user fetching logic here...
  res.json({ user });
});

// Example of async route with try-catch
app.get('/async-example', async (req, res, next) => {
  try {
    // Simulating an async operation that fails
    await Promise.reject(new Error('Database connection failed'));
  } catch (error) {
    // The error handler will automatically handle this
    next(error);
  }
});

// Add the error handler middleware last
app.use(createErrorHandler({
  // Include stack traces only in development
  includeStackTrace: process.env.NODE_ENV !== 'production',
  
  // Custom logging if needed
  logError: (error) => {
    console.error('[App Error]:', error);
  },
  
  // Custom error transformation if needed
  transformError: (error) => {
    if (error.name === 'JsonWebTokenError') {
      return {
        message: 'Invalid token format',
        statusCode: 401,
        code: 'INVALID_TOKEN'
      };
    }
    return undefined; // Use default transformation
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 