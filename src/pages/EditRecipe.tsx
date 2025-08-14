import React, { useState, useEffect } from 'react';
import { Recipe } from '../data';
import './styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';

export type RecipeDraft = Omit<Recipe, 'image'> & {
  image: File | string;
};

interface EditProps {
  recipe: Recipe;
  onSave: (updatedRecipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onCancel: () => void;
  contentsPageOffset: number;
}

export const EditRecipeImagePage: React.FC<Omit<EditProps, 'onSave' | 'onDelete' | 'onCancel' | 'contentsPageOffset'>> = ({ recipe }) => {
  // This component can be simpler as we are just displaying the image for now.
  // A future improvement could be to allow changing the image.
  return (
    <div className="page-content recipe-page-layout">
      <div className="recipe-image-container">
        <img src={recipe.image} alt={recipe.title} className="recipe-image" />
      </div>
    </div>
  );
};

export const EditRecipeFormPage: React.FC<EditProps> = ({
  recipe,
  onSave,
  onDelete,
  onCancel,
  contentsPageOffset,
}) => {
  const [draft, setDraft] = useState<RecipeDraft>({ ...recipe });

  const textFromList = (list: string[]) => list.join('\n');
  const [ingredientsText, setIngredientsText] = useState<string>(textFromList(draft.ingredients));
  const [stepsText, setStepsText] = useState<string>(textFromList(draft.steps));

  useEffect(() => {
    setDraft({ ...recipe });
    setIngredientsText(textFromList(recipe.ingredients));
    setStepsText(textFromList(recipe.steps));
  }, [recipe]);

  const parseLines = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);

  const parsedIngredients = parseLines(ingredientsText);
  const parsedSteps = parseLines(stepsText);
  const isValid =
    draft.title.trim().length > 0 &&
    draft.prepTime.trim().length > 0 &&
    draft.cookingTime.trim().length > 0 &&
    parsedIngredients.length > 0 &&
    parsedSteps.length > 0;

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isValid) return;
    const normalizedSteps = parsedSteps.map((s) => (s.endsWith('.') ? s : s + '.'));
    const updatedRecipe: Recipe = {
      ...(draft as Recipe),
      title: draft.title.trim(),
      ingredients: parsedIngredients,
      steps: normalizedSteps,
    };
    onSave(updatedRecipe);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      onDelete(recipe);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft({ ...recipe });
    setIngredientsText(textFromList(recipe.ingredients));
    setStepsText(textFromList(recipe.steps));
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
  };

  return (
    <div className="page-content recipe-details-layout new-recipe-right" onClick={(e) => e.stopPropagation()}>
      <h2>Edit Recipe</h2>

      <div className="form-row">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={draft.title}
          onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
        />
      </div>

      <div className="form-row two-cols">
        <div>
          <label htmlFor="prep">Prep Time</label>
          <input
            id="prep"
            type="text"
            value={draft.prepTime}
            onChange={(e) => setDraft((p) => ({ ...p, prepTime: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="cook">Cooking Time</label>
          <input
            id="cook"
            type="text"
            value={draft.cookingTime}
            onChange={(e) => setDraft((p) => ({ ...p, cookingTime: e.target.value }))}
          />
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="ingredients">Ingredients (one per line)</label>
        <textarea
          id="ingredients"
          rows={6}
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label htmlFor="steps">Steps (one per line)</label>
        <textarea
          id="steps"
          rows={8}
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button className="btn primary" onClick={handleSave} disabled={!isValid} aria-disabled={!isValid} title="Save">
          <FontAwesomeIcon icon={faSave} />
        </button>
        <button className="btn" onClick={handleReset} title="Reset Changes">
          <FontAwesomeIcon icon={faUndo} />
        </button>
        <button className="btn danger" onClick={handleDelete} title="Delete Recipe">
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
       <button className="btn" onClick={handleCancel} style={{marginTop: '10px'}}>Cancel</button>
    </div>
  );
};
