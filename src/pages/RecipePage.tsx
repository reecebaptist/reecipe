import React from 'react';
import { Recipe } from '../data';
import './styles.css';

interface RecipePageProps {
  recipe: Recipe;
}

const RecipePage: React.FC<RecipePageProps> = ({ recipe }) => {
  return (
    <div className="page-content recipe-page-layout">
      <div className="recipe-image-container">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="recipe-image"
        />
      </div>
    </div>
  );
};

interface RecipeDetailsPageProps {
  recipe: Recipe;
  pageNumber?: number;
}

export const RecipeDetailsPage: React.FC<RecipeDetailsPageProps> = ({
  recipe,
  pageNumber,
}) => {
  return (
    <div className="page-content recipe-details-layout">
      <h2>{recipe.title}</h2>
      <div className="recipe-times">
        <p>
          <strong>Prep Time:</strong> {recipe.prepTime}
        </p>
        <p>
          <strong>Cooking Time:</strong> {recipe.cookingTime}
        </p>
      </div>
      <div className="recipe-ingredients">
        <h3>Ingredients</h3>
        <ul>
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>
      <div className="recipe-steps">
        <h3>Steps</h3>
        <ol>
          {recipe.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
      {pageNumber && <div className="page-number">{pageNumber}</div>}
    </div>
  );
};

export default RecipePage;
