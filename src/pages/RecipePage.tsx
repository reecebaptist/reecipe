import React, { useContext } from 'react';
import { Recipe } from '../data';
import './styles.css';
import { BookContext } from '../context/BookContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';

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
  const bookContext = useContext(BookContext);
  const goToContents = (e: React.MouseEvent) => {
    e.stopPropagation();
    bookContext?.handleFlip(2);
  };

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
        <button
          className="contents-link"
          onClick={goToContents}
          aria-label="Go to Contents"
          title="Go to Contents"
        >
          <FontAwesomeIcon icon={faList} />
        </button>
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
