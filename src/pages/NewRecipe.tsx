import React, { useContext, useRef } from 'react';
import { Recipe } from '../data';
import { BookContext } from '../context/BookContext';
import './styles.css';

export type RecipeDraft = Recipe;

export const createEmptyDraft = (): RecipeDraft => ({
  title: '',
  image: '',
  cookingTime: '',
  prepTime: '',
  ingredients: [],
  steps: [],
});

interface DraftProps {
  draft: RecipeDraft;
  setDraft: (updater: (prev: RecipeDraft) => RecipeDraft) => void;
}

export const NewRecipeImagePage: React.FC<DraftProps> = ({ draft, setDraft }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setDraft((prev) => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page-content recipe-page-layout new-recipe-left" onClick={(e) => e.stopPropagation()}>
      <div className="recipe-image-container">
        {draft.image ? (
          <img src={draft.image} alt={draft.title || 'New recipe image'} className="recipe-image" />
        ) : (
          <div className="image-upload-placeholder" onClick={() => fileInputRef.current?.click()}>
            <p>Click to upload an image</p>
            <p className="hint">PNG, JPG up to ~3MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
      </div>
    </div>
  );
};

interface DraftFormProps extends DraftProps {
  onSave: (draft: RecipeDraft) => void;
  onReset: () => void;
  onDelete: () => void;
  // Used to compute page flip after save
  contentsPageOffset: number;
  newRecipeIndex: number; // index the recipe will have after saving (current recipes length)
}

export const NewRecipeFormPage: React.FC<DraftFormProps> = ({
  draft,
  setDraft,
  onSave,
  onReset,
  onDelete,
  contentsPageOffset,
  newRecipeIndex,
}) => {
  const bookContext = useContext(BookContext);

  // All fields must be filled, including at least one ingredient and step, and an image
  const isValid =
    draft.title.trim().length > 0 &&
    typeof draft.image === 'string' && draft.image.trim().length > 0 &&
    draft.prepTime.trim().length > 0 &&
    draft.cookingTime.trim().length > 0 &&
    draft.ingredients.length > 0 &&
    draft.steps.length > 0;

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isValid) return; // guard
    const trimmedTitle = draft.title.trim();
    if (!trimmedTitle) {
      alert('Please enter a title before saving.');
      return;
    }
    const normalized: RecipeDraft = {
      ...draft,
      title: trimmedTitle,
      ingredients: draft.ingredients.map((s) => s.trim()).filter(Boolean),
      steps: draft.steps.map((s) => s.trim()).filter(Boolean),
    };
    onSave(normalized);

    // Flip to the newly created recipe spread (left/image page)
    const pageNum = contentsPageOffset + newRecipeIndex * 2; // logical left page number
    const physicalPage = Math.floor((pageNum - 1) / 2 + 1);
    bookContext?.handleFlip(physicalPage);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReset();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    // Go back to contents (consistent with other pages)
    bookContext?.handleFlip(2);
  };

  // Helpers to bind textarea values to string[]
  const textFromList = (list: string[]) => list.join('\n');
  const listFromText = (text: string) =>
    text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

  return (
    <div className="page-content recipe-details-layout new-recipe-right" onClick={(e) => e.stopPropagation()}>
      <h2>New Recipe</h2>

      <div className="form-row">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={draft.title}
          onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
          placeholder="e.g., Creamy Tomato Pasta"
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
            placeholder="e.g., 10 minutes"
          />
        </div>
        <div>
          <label htmlFor="cook">Cooking Time</label>
          <input
            id="cook"
            type="text"
            value={draft.cookingTime}
            onChange={(e) => setDraft((p) => ({ ...p, cookingTime: e.target.value }))}
            placeholder="e.g., 20 minutes"
          />
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="ingredients">Ingredients (one per line)</label>
        <textarea
          id="ingredients"
          rows={6}
          value={textFromList(draft.ingredients)}
          onChange={(e) => setDraft((p) => ({ ...p, ingredients: listFromText(e.target.value) }))}
          placeholder={"e.g.\n200g spaghetti\n2 eggs\n50g cheese"}
        />
      </div>

      <div className="form-row">
        <label htmlFor="steps">Steps (one per line)</label>
        <textarea
          id="steps"
          rows={8}
          value={textFromList(draft.steps)}
          onChange={(e) => setDraft((p) => ({ ...p, steps: listFromText(e.target.value) }))}
          placeholder={"e.g.\nBoil pasta\nMake sauce\nCombine and serve"}
        />
      </div>

      <div className="form-actions">
        <button className="btn primary" onClick={handleSave} disabled={!isValid} aria-disabled={!isValid}>Save</button>
        <button className="btn" onClick={handleReset}>Reset</button>
        <button className="btn danger" onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};
