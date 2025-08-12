import coverBg2 from './assets/images/cover-bg-2.avif';
import coverBg3 from './assets/images/cover-bg-3.avif';
import coverBg from './assets/images/cover-bg.avif';

export interface Recipe {
  image: string;
  cookingTime: string;
  prepTime: string;
  ingredients: string[];
  steps: string[];
  title: string;
}

export const recipeData: Recipe[] = [
  {
    title: 'Spaghetti Carbonara',
    image: coverBg,
    cookingTime: '20 minutes',
    prepTime: '10 minutes',
    ingredients: [
      '200g spaghetti',
      '100g pancetta',
      '2 large eggs',
      '50g pecorino cheese',
      'Black pepper',
    ],
    steps: [
      'Cook the spaghetti.',
      'Fry the pancetta until crisp.',
      'Whisk eggs and cheese.',
      'Combine everything and serve with pepper.',
    ],
  },
  {
    title: 'Chicken Curry',
    image: coverBg2,
    cookingTime: '40 minutes',
    prepTime: '15 minutes',
    ingredients: [
      '500g chicken breast',
      '1 onion, chopped',
      '2 cloves garlic, minced',
      '1 tbsp curry powder',
      '400ml coconut milk',
      '1 tbsp vegetable oil',
      'Salt to taste',
    ],
    steps: [
      'Heat oil in a pan and sauté onions and garlic.',
      'Add chicken and cook until browned.',
      'Stir in curry powder.',
      'Pour in coconut milk, bring to a simmer, and cook for 20 minutes.',
      'Season with salt and serve.',
    ],
  },
  {
    title: 'Classic Beef Tacos',
    image: coverBg3,
    cookingTime: '25 minutes',
    prepTime: '20 minutes',
    ingredients: [
      '500g ground beef',
      '1 packet taco seasoning',
      '12 taco shells',
      'Toppings: lettuce, tomato, cheese, sour cream',
    ],
    steps: [
      'Cook beef until browned.',
      'Drain fat and stir in taco seasoning and a little water.',
      'Simmer for 5 minutes.',
      'Warm taco shells.',
      'Assemble tacos with beef and desired toppings.',
    ],
  },
];
