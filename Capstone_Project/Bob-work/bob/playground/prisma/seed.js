'use strict';

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const books = [
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self Help',
    genre: 'Self Development',
    description:
      'An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results.',
    price: 499,
    stock: 50,
    publishedBy: 'Penguin Random House',
    language: 'English',
    imageUrl: '/images/atomic-habits.jpg',
    rating: 4.8,
  },
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    category: 'Finance',
    genre: 'Personal Finance',
    description:
      'Timeless lessons on wealth, greed, and happiness. How money really works in the real world.',
    price: 399,
    stock: 35,
    publishedBy: 'Jaico Publishing House',
    language: 'English',
    imageUrl: '/images/psychology-of-money.jpg',
    rating: 4.7,
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'Self Help',
    genre: 'Productivity',
    description:
      'Rules for focused success in a distracted world. The ability to perform deep work is rare and valuable.',
    price: 449,
    stock: 40,
    publishedBy: 'Grand Central Publishing',
    language: 'English',
    imageUrl: '/images/deep-work.jpg',
    rating: 4.5,
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'History',
    genre: 'Non-Fiction',
    description:
      'A sweeping narrative of human history from the Stone Age to the twenty-first century.',
    price: 599,
    stock: 30,
    publishedBy: 'Harper Collins',
    language: 'English',
    imageUrl: '/images/sapiens.jpg',
    rating: 4.6,
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    category: 'Fiction',
    genre: 'Philosophical Fiction',
    description:
      "A magical story about following your dreams. The world's most beloved novel about listening to your heart.",
    price: 299,
    stock: 60,
    publishedBy: 'HarperOne',
    language: 'English',
    imageUrl: '/images/the-alchemist.jpg',
    rating: 4.2,
  },
  {
    title: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    category: 'Finance',
    genre: 'Personal Finance',
    description:
      "What the rich teach their kids about money that the poor and middle class do not. A classic financial education book.",
    price: 349,
    stock: 45,
    publishedBy: 'Plata Publishing',
    language: 'English',
    imageUrl: '/images/rich-dad-poor-dad.jpg',
    rating: 4.0,
  },
  {
    title: 'Ikigai: The Japanese Secret to a Long and Happy Life',
    author: 'Héctor García & Francesc Miralles',
    category: 'Self Help',
    genre: 'Lifestyle',
    description:
      'Unlock your purpose and find fulfillment in the Japanese philosophy of Ikigai.',
    price: 279,
    stock: 55,
    publishedBy: 'Penguin Books',
    language: 'English',
    imageUrl: '/images/ikigai.jpg',
    rating: 4.3,
  },
  {
    title: 'The Subtle Art of Not Giving a F*ck',
    author: 'Mark Manson',
    category: 'Self Help',
    genre: 'Self Development',
    description:
      'A counterintuitive approach to living a good life. Stop trying to be positive all the time.',
    price: 379,
    stock: 38,
    publishedBy: 'HarperOne',
    language: 'English',
    imageUrl: '/images/subtle-art.jpg',
    rating: 4.1,
  },
  {
    title: '1984',
    author: 'George Orwell',
    category: 'Fiction',
    genre: 'Dystopian Fiction',
    description:
      'A chilling prophecy about the future. A masterpiece about totalitarianism and the power of truth.',
    price: 249,
    stock: 70,
    publishedBy: 'Secker & Warburg',
    language: 'English',
    imageUrl: '/images/1984.jpg',
    rating: 4.7,
  },
  {
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    category: 'Self Help',
    genre: 'Success',
    description:
      'The classic bestseller on the philosophy of personal achievement and success mindset.',
    price: 199,
    stock: 65,
    publishedBy: 'Sound Wisdom',
    language: 'English',
    imageUrl: '/images/think-and-grow-rich.jpg',
    rating: 3.9,
  },
];

async function main() {
  console.log('Seeding database...');

  for (const book of books) {
    await prisma.product.upsert({
      where: { id: books.indexOf(book) + 1 },
      update: book,
      create: book,
    });
  }

  console.log(`Seeded ${books.length} books successfully.`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
