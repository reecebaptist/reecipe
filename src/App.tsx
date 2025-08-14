import React from 'react';
import './App.css';
import Book, { BookRef } from './components/Book';
import Cover from './pages/Cover';
import BackCover from './pages/BackCover';
import Foreword from './pages/Foreword';
import { recipeData, type Recipe } from './data';
import RecipePage, { RecipeDetailsPage } from './pages/RecipePage';
import BlankPage from './pages/BlankPage';
import ContentsPage from './pages/ContentsPage';
import {
  EditRecipeFormPage,
  EditRecipeImagePage,
} from './pages/EditRecipe';
import {
  listRecipes,
  seedRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
} from './services/recipes';
import { NewRecipeFormPage, NewRecipeImagePage, createEmptyDraft, type RecipeDraft } from './pages/NewRecipe';

function App() {
  const contentsPageOffset = 5;
  const [recipes, setRecipes] = React.useState<Recipe[]>(recipeData);
  const [loading, setLoading] = React.useState(true);
  const [draft, setDraft] = React.useState<RecipeDraft>(createEmptyDraft());
  const [addingNewRecipe, setAddingNewRecipe] = React.useState(false);
  const [editingRecipe, setEditingRecipe] = React.useState<Recipe | null>(null);
  const [newImageFile, setNewImageFile] = React.useState<File | undefined>();
  const bookRef = React.useRef<BookRef>(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const dbRecipes = await listRecipes();
        if (!mounted) return;
        if (dbRecipes.length === 0) {
          // Seed once if table is empty
          await seedRecipes(recipeData);
          const seeded = await listRecipes();
          if (!mounted) return;
          setRecipes(seeded.length ? seeded : recipeData);
        } else {
          setRecipes(dbRecipes);          
        }
      } catch (err: any) {        
        // If Supabase not configured or any error, fall back to local data
        setRecipes(recipeData);
        // Optionally log in dev
        // console.warn('Using local recipe data. Reason:', err?.message || err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveDraft = async (r: RecipeDraft) => {
    const newRecipe = await addRecipe(r);
    if (newRecipe) {
      setRecipes((prev: any) => [...prev, r]);
    }
    setDraft(createEmptyDraft());
    setAddingNewRecipe(false);
  };

  const handleResetDraft = () => {
    setDraft(createEmptyDraft());
  };

  const handleDeleteDraft = () => {
    setDraft(createEmptyDraft());
    setAddingNewRecipe(false);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setNewImageFile(undefined); // Reset any lingering new image file
    const editingPageIndex = recipes.length + (addingNewRecipe ? 1 : 0);
    const physicalPage = Math.floor((contentsPageOffset + editingPageIndex * 2 -1) / 2 + 1);
    bookRef.current?.handleFlip(physicalPage);
  };

  const handleUpdateRecipe = async (updatedRecipe: Recipe, newImageFile?: File) => {
    const result = await updateRecipe(updatedRecipe, newImageFile);
    if (result) {
      // The result from updateRecipe should include the new image URL
      const finalRecipe = { ...updatedRecipe, image: result.image };
      setRecipes(recipes.map(r => r.title === finalRecipe.title ? finalRecipe : r));
    }
    setEditingRecipe(null);
    setNewImageFile(undefined);
  };

  const handleDeleteRecipe = async (recipeToDelete: Recipe) => {
    await deleteRecipe(recipeToDelete.title);
    setRecipes(recipes.filter(r => r.title !== recipeToDelete.title));
    setEditingRecipe(null);
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
    setNewImageFile(undefined);
  };

  if (loading) {
    return <div className="App">Loading recipes…</div>;
  }

  const newRecipeIndex = recipes.length; // index future recipe will take

  const pages = React.Children.toArray([
    <Cover />,
    <BlankPage />,
    <Foreword />,
    <ContentsPage
      recipes={recipes}
      pageNumber={1}
      pageOffset={contentsPageOffset}
      onAddNew={() => setAddingNewRecipe(true)}
      onEdit={handleEditRecipe}
    />,
    <ContentsPage
      recipes={recipes}
      pageNumber={2}
      pageOffset={contentsPageOffset}
      onAddNew={() => setAddingNewRecipe(true)}
      onEdit={handleEditRecipe}
    />,
    recipes.flatMap((recipe, index) => {
      const pageNum = contentsPageOffset + index * 2 + 1;
      return [
        <RecipePage key={`img-${index}`} recipe={recipe} />,
        <RecipeDetailsPage
          key={`details-${index}`}
          recipe={recipe}
          pageNumber={pageNum}
        />,
      ];
    }),
    addingNewRecipe && [
      <NewRecipeImagePage
        key="new-recipe-img"
        draft={draft}
        setDraft={(updater) => setDraft((prev) => updater(prev))}
      />,
      <NewRecipeFormPage
        key="new-recipe-form"
        draft={draft}
        setDraft={(updater) => setDraft((prev) => updater(prev))}
        onSave={handleSaveDraft}
        onReset={handleResetDraft}
        onDelete={handleDeleteDraft}
        contentsPageOffset={contentsPageOffset}
        newRecipeIndex={newRecipeIndex}
      />,
    ],
    editingRecipe && [
      <EditRecipeImagePage
        key="edit-recipe-img"
        recipe={editingRecipe}
        onImageChange={setNewImageFile}
      />,
      <EditRecipeFormPage
        key="edit-recipe-form"
        recipe={editingRecipe}
        onSave={handleUpdateRecipe}
        onDelete={handleDeleteRecipe}
        onCancel={handleCancelEdit}
        contentsPageOffset={contentsPageOffset}
      />
    ],
    <BackCover />,
  ]);

  return (
    <div className="App">
      <Book ref={bookRef}>{pages}</Book>
    </div>
  );
}

export default App;
