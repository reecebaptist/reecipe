import React, { useContext, useRef } from 'react';
import { Recipe } from '../data';
import { BookContext } from '../context/BookContext';
import './styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';

export type RecipeDraft = Omit<Recipe, 'image'> & {
  image: File | string;
};

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
    setDraft((prev) => ({ ...prev, image: file }));
  };

  const imageUrl = React.useMemo(() => {
    if (typeof draft.image === 'string') {
      return draft.image;
    } else if (draft.image instanceof File) {
      return URL.createObjectURL(draft.image);
    }
    return '';
  }, [draft.image]);

  return (
    <div className="page-content recipe-page-layout new-recipe-left" onClick={(e) => e.stopPropagation()}>
      <div className="recipe-image-container">
        {imageUrl ? (
          <img src={imageUrl} alt={draft.title || 'New recipe image'} className="recipe-image" onClick={() => fileInputRef.current?.click()}/>
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

  // Local text state so users can add spaces/blank lines while typing
  const textFromList = (list: string[]) => list.join('\n');
  const [ingredientsText, setIngredientsText] = React.useState<string>(textFromList(draft.ingredients));
  const [stepsText, setStepsText] = React.useState<string>(textFromList(draft.steps));

  // Sync local text state when draft resets/changes
  React.useEffect(() => {
    setIngredientsText(textFromList(draft.ingredients));
  }, [draft.ingredients]);
  React.useEffect(() => {
    setStepsText(textFromList(draft.steps));
  }, [draft.steps]);

  const parseLines = (text: string) =>
    text.split('\n').map((l) => l.trim()).filter(Boolean);

  // All fields must be filled, including at least one ingredient and step, and an image
  const parsedIngredients = parseLines(ingredientsText);
  const parsedSteps = parseLines(stepsText);
  const isValid =
    draft.title.trim().length > 0 &&
    !!draft.image &&
    draft.prepTime.trim().length > 0 &&
    draft.cookingTime.trim().length > 0 &&
    parsedIngredients.length > 0 &&
    parsedSteps.length > 0;

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isValid) return; // guard
    const trimmedTitle = draft.title.trim();
    if (!trimmedTitle) {
      alert('Please enter a title before saving.');
      return;
    }
    // Ensure each step ends with a full stop
    const normalizedSteps = parsedSteps.map((s) => (s.endsWith('.') ? s : s + '.'));
    const normalized: RecipeDraft = {
      ...draft,
      title: trimmedTitle,
      ingredients: parsedIngredients,
      steps: normalizedSteps,
    };
    onSave(normalized);

    // Flip back to Contents after saving
    bookContext?.handleFlip(2);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReset();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Flip back to contents first, then remove the new pages after the flip animation ends
    if (bookContext) {
      bookContext.handleFlip(2);
      const ANIMATION_BUFFER_MS = 1050; // Book flip is 1000ms; add small buffer
      window.setTimeout(() => {
        onDelete();
      }, ANIMATION_BUFFER_MS);
    } else {
      onDelete();
    }
  };

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
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          placeholder={"e.g.\n200g spaghetti\n2 eggs\n50g cheese"}
        />
      </div>

      <div className="form-row">
        <label htmlFor="steps">Steps (one per line)</label>
        <textarea
          id="steps"
          rows={8}
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
          placeholder={"e.g.\nBoil pasta\nMake sauce\nCombine and serve"}
        />
      </div>

      <div className="form-actions">
        <button className="btn primary" onClick={handleSave} disabled={!isValid} aria-disabled={!isValid} title="Save">
          <FontAwesomeIcon icon={faSave} />
        </button>
        <button className="btn" onClick={handleReset} title="Reset">
          <FontAwesomeIcon icon={faUndo} />
        </button>
        <button className="btn danger" onClick={handleDelete} title="Delete">
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
};
