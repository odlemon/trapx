import express from 'express';
import { 
  createErrorHandler, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError 
} from '../src';

const app = express();

app.use(express.json());

app.post('/users', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required', {
      details: {
        missing: !email ? 'email' : 'password'
      }
    });
  }

  res.status(201).json({ message: 'User created successfully' });
});

app.get('/protected', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError('No authorization token provided');
  }

  res.json({ message: 'Protected data' });
});

app.get('/users/:id', (req, res) => {
  const user = null; 

  if (!user) {
    throw new NotFoundError(`User with id ${req.params.id} not found`);
  }

  res.json({ user });
});

app.get('/async-example', async (req, res, next) => {
  try {
    await Promise.reject(new Error('Database connection failed'));
  } catch (error) {
    next(error);
  }
});

app.use(createErrorHandler({

  includeStackTrace: process.env.NODE_ENV !== 'production',
  
  logError: (error) => {
    console.error('[App Error]:', error);
  },
  
  transformError: (error) => {
    if (error.name === 'JsonWebTokenError') {
      return {
        message: 'Invalid token format',
        statusCode: 401,
        code: 'INVALID_TOKEN'
      };
    }
    return undefined; 
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 