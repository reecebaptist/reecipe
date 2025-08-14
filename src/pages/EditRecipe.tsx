import React, { useState, useEffect, useRef, useContext } from 'react';
import { Recipe } from '../data';
import './styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faUndo, faImage } from '@fortawesome/free-solid-svg-icons';
import { BookContext } from '../context/BookContext';

export type RecipeDraft = Omit<Recipe, 'image'> & {
  image: File | string;
};

interface EditProps {
  recipe: Recipe;
  onSave: (updatedRecipe: Recipe, newImageFile?: File) => void;
  onDelete: (recipe: Recipe) => void;
  onCancel: () => void;
  contentsPageOffset: number;
}

interface EditImageProps {
  recipe: Recipe;
  onImageChange: (file: File) => void;
}

export const EditRecipeImagePage: React.FC<EditImageProps> = ({ recipe, onImageChange }) => {
  const [previewUrl, setPreviewUrl] = useState<string>(recipe.image);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPreviewUrl(recipe.image);
  }, [recipe.image]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
    onImageChange(file);
  };

  const handleReplaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className="page-content recipe-page-layout new-recipe-left" onClick={(e) => e.stopPropagation()}>
      <div className="recipe-image-container edit-recipe-image-container">
        <img src={previewUrl} alt={recipe.title} className="recipe-image" />
        <button
          className="image-replace-btn"
          onClick={handleReplaceClick}
          aria-label="Replace Image"
          title="Replace Image"
        >
          <FontAwesomeIcon icon={faImage} />
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
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
  const [newImageFile, setNewImageFile] = useState<File | undefined>();
  const bookContext = useContext(BookContext);

  const textFromList = (list: string[]) => list.join('\n');
  const [ingredientsText, setIngredientsText] = useState<string>(textFromList(draft.ingredients));
  const [stepsText, setStepsText] = useState<string>(textFromList(draft.steps));

  useEffect(() => {
    setDraft({ ...recipe });
    setIngredientsText(textFromList(recipe.ingredients));
    setStepsText(textFromList(recipe.steps));
    setNewImageFile(undefined);
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
    onSave(updatedRecipe, newImageFile);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      await Promise.resolve(onDelete(recipe));
      bookContext?.handleFlip(2);
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
    bookContext?.handleFlip(2);
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
