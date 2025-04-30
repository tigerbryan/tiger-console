import { hash } from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function createUser() {
  const username = 'tiger';
  const password = 'tiger123';
  
  try {
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name: username,
      }
    });
    
    console.log('User created:', user);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser(); 