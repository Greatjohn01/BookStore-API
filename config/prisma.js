import { PrismaClient } from '../generated/prisma/index.js';


// create a centralized prismaClient instance to be used by other files
 export const prisma = new PrismaClient();