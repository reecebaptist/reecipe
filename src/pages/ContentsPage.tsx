import React, { useContext, useState } from 'react';
import { Recipe } from '../data';
import { BookContext } from '../context/BookContext';
import './styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';

interface ContentsPageProps {
  recipes: Recipe[];
  pageNumber: 1 | 2;
  pageOffset: number;
  onAddNew: () => void;
  onEdit: (recipe: Recipe) => void;
}

const ContentsPage: React.FC<ContentsPageProps> = ({
  recipes,
  pageNumber,
  pageOffset,
  onAddNew,
  onEdit,
}) => {
  const bookContext = useContext(BookContext);
  const [editMode, setEditMode] = useState(false);
  const ITEMS_PER_PAGE = 15;
  const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
  const pageRecipes = recipes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (pageRecipes.length === 0) {
    return <div className="page-content" />;
  }

  // Go directly to the requested logical page number without extra flips
  const handleContentClick = (pageNum: number) => {
    if (bookContext) {
      // Convert 1-based logical page number to physical page index
      const physicalPage = Math.floor((pageNum - 1) / 2 + 1);
      bookContext.handleFlip(physicalPage);
    }
  };

  // Flip to the dedicated "new recipe" spread at the end
  const handleAddNew = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddNew();

    const doFlip = () => {
      // Left page of the new spread directly follows existing recipes
      const newLeftLogicalPage = pageOffset + recipes.length * 2;
      const physicalPage = Math.floor((newLeftLogicalPage - 1) / 2 + 1);
      bookContext?.handleFlip(physicalPage);
    };

    // Defer flip until after React has rendered the new pages
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => requestAnimationFrame(doFlip));
    } else {
      setTimeout(doFlip, 0);
    }
  };

  const lastOverallIndex = recipes.length - 1;
  const showsLastRecipe =
    lastOverallIndex >= startIndex &&
    lastOverallIndex < startIndex + pageRecipes.length;

  return (
    <div className={`page-content contents-page-layout ${editMode ? 'edit-mode' : ''}`}>
      {pageNumber === 1 && <h1>Contents</h1>}
      <ul className="contents-list">
        {pageRecipes.map((recipe, index) => {
          const recipeIndex = startIndex + index;
          const pageNum = pageOffset + recipeIndex * 2;
          return (
            <li
              key={recipeIndex}
              onClick={(e) => {
                e.stopPropagation();
                if (editMode) {
                  setEditMode(false); // turn off edit mode after selecting a recipe to edit
                  onEdit(recipe);
                } else {
                  handleContentClick(pageNum);
                }
              }}
              title={editMode ? 'Click to edit this recipe' : 'Click to open this recipe'}
            >
              <span>{recipe.title}</span>
              <span className="dot-leader"></span>
              <span className="page-num">{pageNum}</span>
            </li>
          );
        })}
      </ul>
      {showsLastRecipe && (
        <div className="contents-actions">
          <button className="btn small add-recipe-btn" onClick={handleAddNew}>
            <FontAwesomeIcon icon={faPlus} />
            Add new recipe
          </button>
          <button
            className={`btn small add-recipe-btn toggle-btn ${editMode ? 'is-on' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setEditMode((m) => !m);
            }}
            aria-pressed={editMode}
            title={editMode ? 'Exit edit mode' : 'Enter edit mode'}
          >
            <FontAwesomeIcon icon={faEdit} />
            Edit Recipe
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentsPage;
